var tedious = require("tedious"),
	TYPES = tedious.TYPES,
	ConnectionPool = require("tedious-connection-pool");

// ## splitRow
// Splits the row into objects along the key columns provided
function splitRow(rowColumns, keyColumns) {
	var parentPos = 0,
		childPos = 1,
		objects = [{}];

	for (var i = 0; i < rowColumns.length; i++) {
		var col = rowColumns[i];

		if (col.metadata.colName === keyColumns[childPos] && i > 0) {
			objects.push({});
			parentPos = parentPos + 1;
			childPos = childPos + 1;
		}

		objects[parentPos][col.metadata.colName] = col.value;
	}

	return objects;
}

// ## mapObject
// mapper:
// { mapTo: "items", parentKey: "id", childKey: "character_id" }
function mapObject(parents, child, mapper) {
	var k = mapper.childKey,
		p = parents[child[k]];

	if (p) {
		if (!p.hasOwnProperty(mapper.mapTo)) {
			parents[child[k]][mapper.mapTo] = [];
		}

		parents[child[k]][mapper.mapTo].push(child);
	}

	return parents;
}

// ## nestObjects
function nestObjects(objects, properties) {
	var result = objects[0],
		propPos = 0,
		temp;

	for (var i = 1; i < objects.length; i++) {
		var k = properties[propPos];

		if (result.hasOwnProperty(k)) {
		   	if (!(result[k] instanceof Array)) {
				result[k] = [result[k]];
			}
			result[k].push(objects[i]);
		}
		else {
			result[k] = objects[i];
		}

		if (i < properties.length) {
			propPos = i - 1;
			result = objects[i];
		}
	}

	return objects[0];
}

// # RowHandler
// Super-light helper for collecting row data from the Tedious SQL driver
function RowHandler() {
	var me = this;

	me.buffer = [];
	me.handle = function (columns) {
		var row = {};
		columns.forEach(function (col) {
			row[col.metadata.colName] = col.value;
		});

		me.buffer.push(row);
	};
}

// # RowRoller
// Object used to rollup rows
function RowRoller(parentKeyColumn) {
	var me = this;
	me.parentKeyColumn = parentKeyColumn || "id";
	me.data = {};

	// rollup data for each unique parent key
	// when complete, we should have a nice hashtable/map
	// of parent key => rows
	me.handle = function (columns) {
		var row = {},
			buffer;

		columns.forEach(function (col) {
			row[col.metadata.colName] = col.value;
		});

		buffer = me.data[row[parentKeyColumn]];
		if (!buffer) {
			// build new array
			me.data[row[parentKeyColumn]] = [];
			buffer = me.data[row[parentKeyColumn]];
		}
	
		buffer.push(row);	
	};
}

// # RowMapper
// Maps rows to objects, building a structured object hierarchy along the way.
// Returns an array of objects, with array position representing a tier (e.g., 0 is the highest).
// Each one of these objects acts a dictionary to lookup object by primary key,
// as specified in `keyColumns`.
//
// mapper:
// { mapTo: "items", parentKey: "character_id" }
// 
// returns: [
// { 
//   1: { id: 1, value: "foo" },
//   2: { id: 2, value: "bar" }
// }
// ]
function RowMapper(keyColumns, mappers) {
	var me = this;

	me.buffer = [];

	keyColumns.forEach(function () {
		me.buffer.push({});
	});

	// TODO: build the objects backwards!
	// split the row into objects and then try to map objects to each other
	me.handle = function (columns) {
		var objects = splitRow(columns, keyColumns);

		for (var i = 0; i < objects.length; i++) {
			var obj = objects[i],
				mapped = false;
			if (!me.buffer[i][obj[keyColumns[i]]]) {
				me.buffer[i][obj[keyColumns[i]]] = obj;
			} else {
				mapped = true;
			}

			if (i > 0 ) {
				var map = mappers[i-1],
					parent = me.buffer[i-1][obj[map.parentKey]];

				if (parent && !mapped) {
					if (!parent[map.mapTo]) {
						parent[map.mapTo] = [];
					}

					// adding
					parent[map.mapTo].push(obj);
				}
			}
		}
	};

	// finalize by only returning the highest-level objects
	me.finalize = function () {
		var fin = [];
	   	Object.keys(me.buffer[0]).forEach(function (k) {
			fin.push(me.buffer[0][k]);
		});

		me.buffer = fin;
	};
}

// # Miss
// Simple wrapper for the miss library functions that retains connection information
function Miss(connectionConfig, poolConfig) {
	var me = this;

	me.connectionConfig = connectionConfig;
	me.poolConfig = poolConfig || {
		max: 10,
		min: 0,
		idleTimeoutMillis: 30000	
	};

	// ## executeQuery / exec
	// Executes the specified SQL query; see `executeQuery` for more info.
	me.executeQuery = function (query, parameters, isProcedure, cb) {
		me.connectionPool.requestConnection(function (err, conn) {
			executeQuery(conn, query, parameters, isProcedure, cb);
		});
	};

	me.exec = me.executeQuery;

	// ## map
	// Maps rows to objects, building a structured object hierarchy
	me.map = function (query, parameters, isProcedure, keyColumns, mappers, cb) {
		me.connectionPool.requestConnection(function (err, conn) {
			executeQuery(conn, query, parameters, isProcedure,
				cb,
				new RowMapper(keyColumns, mappers)
			);
		});
	};

	me.connectionPool = new ConnectionPool(me.poolConfig, me.connectionConfig);
}

// ## executeQuery
// Executes the specified SQL query, generating an array of result objects (normal key-value pairs).
// This will load all rows into memory in the process, so keep that in mind.
//
// Params:
//
// - sqlConfig: object defining the SQL connection string (see Tedious library documentation for more details)
// - query: the query text (can also be stored procedure name)
// - isProcedure: true if `query` is a stored procedure name
// - cb: callback to fired after the query is complete; cb(err, results)
// - rowHandler: object used to handle/format row data as it is returned (optional; default: RowHandler )
function executeQuery(sqlConfig, query, parameters, isProcedure, cb, rowHandler) {
	var conn = sqlConfig instanceof tedious.Connection ? sqlConfig : new tedious.Connection(sqlConfig),
		execQuery;

	parameters = parameters || {};
	rowHandler = rowHandler || new RowHandler();

	// function to build and execute query
	// we need to build the appropriate tedious parameter objects from the parameters provided,
	// inferring SQL types if not provided
	execQuery = function () {
		// open & close connection when done
		var request = new tedious.Request(query, function (err, rowcount) {
			if (err) {
				console.log(err);
			}

			conn.close();

			if (rowHandler.finalize) {
				rowHandler.finalize();
			}

			// fire callback with results
			cb(err, rowHandler.buffer);
		});

		Object.keys(parameters).forEach(function (k) {
			if (typeof parameters[k] !== "object") {
				var type = inferSqlType(parameters[k]);
				request.addParameter(k, type, parameters[k], defaultParameterOptions(type));
			}
			else {
				request.addParameter(k, parameters[k].type, parameters[k].value);
			}
		});

		request.on("row", rowHandler.handle);

		if (isProcedure) {
			conn.callProcedure(request);
		} else {
			conn.execSql(request);
		}
	};	

	conn.on("connect", function (err) {
		if (err) {
			cb(err);
			return;
		}
		execQuery();	
	});
}

// ## isFloat
// Returns true if the number is a float
function isFloat(n) {
	return n === +n && n !== (n | 0);
}

// ## inferSqlType
// Returns tedious.TYPES value based on the JavaScript type of the object
function inferSqlType(value) {
	var type = typeof value;	
	switch (type) {
		case "string":
			return TYPES.VarChar;
		case "number":
			if (isFloat(value)) {
				return TYPES.Decimal;
			}

			return TYPES.Int;

		default:
			throw new Exception("Cannot infer SQL type for: " + type);
	}
}

// ## defaultParameterOptions
// Returns a default options object based on the provided tedious.TYPES
function defaultParameterOptions(type) {
	switch (type) {
		case TYPES.Decimal:
			return { precision: 18, scale: 8 };
	}
}

module.exports = {
	RowHandler: RowHandler,
	RowRoller: RowRoller,
	RowMapper: RowMapper,
	isFloat: isFloat,
	inferSqlType: inferSqlType,
	nestObjects: nestObjects,
	mapObject: mapObject,
	splitRow: splitRow,
	executeQuery: executeQuery,
	Miss: Miss
};
