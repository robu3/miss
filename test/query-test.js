var assert = require("assert"),
	TYPES = require("tedious").TYPES,
	miss = require("../index.js"),
	config = require("./config.js");

describe("Helper Functions Test", function () {
	describe("#isFloat", function () {
		it("should return true for numbers with significant digits after the decimal point", function () {
			assert.equal(miss.isFloat(1.01), true);
		});

		it("should return false for numbers with only zeroes fter the decimal point", function () {
			assert.equal(miss.isFloat(1.00), false);

			var n = 1.01;
			miss.isFloat(n);
		});

		it("should return false for whole integers", function () {
			assert.equal(miss.isFloat(1), false);
		});
	});

	describe("#inferSqlType", function () {
		it("should return Int for whole integers", function () {
			assert.equal(miss.inferSqlType(1), TYPES.Int);
		});

		it("should return Decimal for floats", function () {
			assert.equal(miss.inferSqlType(1.01), TYPES.Decimal);
		});

		it("should return VarChar for strings", function () {
			assert.equal(miss.inferSqlType("Finn"), TYPES.VarChar);
		});
	});
});

describe("Basic Query Test", function () {
	describe("#executeQuery()", function () {
		it("should return a single object of the form { key: 'myKey', value: 42 }", function (done) {
			miss.executeQuery(config, "select 'myKey' as [key], 42 as [value]", null, false, function (err, results) {
				if (err) { console.log(err); }
				var row = results[0];

				assert.equal(row.key, "myKey");
				assert.equal(row.value, 42);

				done();
			});
		});
	});

	describe("#executeQuery(): with parameters", function () {
		it("should pass parameters into the query: @name, @value", function (done) {
			miss.executeQuery(
				config,
				"select @name as [name], @value as [value]",
				{
					name: { value: "Beemo", type: TYPES.VarChar },
					value: { value: 42, type: TYPES.Int }
				},
				false,
				function (err, results) {
					if (err) { console.log(err); }
					var row = results[0];

					assert.equal(row.name, "Beemo");
					assert.equal(row.value, 42);

					done();
				}
			);
		});
	});

	describe("#executeQuery(): with parameters, without types specified", function () {
		it("should pass pass in @integer as integer, @decimal as decimal", function (done) {
			miss.executeQuery(
				config,
				"select @integer + 100 as [sum_integer], @decimal + 1.01 as [sum_decimal]",
				{
					integer: 3,
					decimal: 1.02
				},
				false,
				function (err, results) {
					if (err) { console.log(err); }
					var row = results[0];

					assert.equal(row.sum_integer, 103);
					assert.equal(row.sum_decimal, 2.03);

					done();
				}
			);
		});
	});
});

describe("Advanced Query Test using Miss Constructor", function () {
	var ms = new miss.Miss(config);
	describe("#map()", function () {
		it("should properly nest 3 tiers of objects", function (done) {
			var callback = function (err, results) {
				if (err) { console.log(err); }

				var finn = results[0];
				assert.equal(finn.first_name, "Finn");
				assert.equal(finn.items.length, 5);
				assert.equal(finn.items[2].effects.length, 3);

				var jake = results[1];
				assert.equal(jake.first_name, "Jake");
				assert.equal(jake.items.length, 1);
				assert.equal(jake.items[0].effects.length, 2);

				done();
			};

			ms.map(
				"select * from characters a left join items b on a.id = b.character_id left join effects c on b.id = c.item_id order by a.id, b.id, c.id",
				null,
				false,
				["id", "id", "id"],
				[
					{ mapTo: "items", parentKey: "character_id" },
					{ mapTo: "effects", parentKey: "item_id" }
				],
				callback
			);
		});
	});

	describe("#exec()", function () {
		it("should properly execute query against database", function (done) {
			var callback = function (err, results) {
				if (err) { console.log(err); }

				var finn = results[0];
				assert.equal(finn.first_name, "Finn");
				assert.equal(finn.last_name, "The Human");
				assert.equal(finn.age, 14);

				var jake = results[1];
				assert.equal(jake.first_name, "Jake");
				assert.equal(jake.last_name, "The Dog");

				done();
			};

			ms.exec(
				"select * from characters order by id",
				null,
				false,
				callback
			);
		});
	});

	describe("#connectionPool", function () {
		it("should create & use a connection pool when using the constructor form", function (done) {
			var counter = 0;

			var callback = function (err, results) {
				if (err) { console.log(err); }

				counter = counter + 1;
				if (counter === 5) {
					// since we opened 5 connections in rapid succession,
					// we should have 5 connections in our pool
					assert.equal(5, ms.connectionPool.pool.getPoolSize());
					done();
				}
			};


			for (var i = 0; i < 5; i++) {
				ms.exec(
					"select * from characters order by id",
					null,
					false,
					callback
				);
			}
		});
	});
});

describe("#splitRow()", function () {
	it("should split a row based on the keyColumns provided", function (done) {
		var Splitter = function (splits) {
			var me = this;

			this.splits = splits;
			this.buffer = [];
			this.handle = function (columns) {
				me.buffer.push(miss.splitRow(columns, me.splits));
			};
		};

		miss.executeQuery(
			config,
			"select 1 as id, 'Finn' as name, 2 as id, 'Jake' as name",
			null,
			false,
			function (err, results) {
				if (err) { console.log(err); }
		
				var row = results[0];	
				assert.equal(row.length, 2);	
				assert.equal(row[0].id, 1);	
				assert.equal(row[0].name, "Finn");	
				assert.equal(row[1].id, 2);	
				assert.equal(row[1].name, "Jake");	

				done();
			},
			new Splitter(["id", "id"])
		);
	});
});

describe("#nestObjects()", function () {
	it("should nest objects by assigning objects to properties", function (done) {
		var nested = miss.nestObjects([
			{ id: 1, name: "Finn" }, 
			{ id: 2, name: "Golden Sword of Battle" }, 
			{ id: 3, name: "Grass Sword" },
			{ id: 3, name: "Hat" } 
		], ["items"]);

		assert.equal(nested.id, 1);
		assert.equal(nested.name, "Finn");
		assert.equal(nested.items.length, 3);
		assert.equal(nested.items[1].name, "Grass Sword");

		done();
	});
});

describe("#nestObjects()", function () {
	it("should map objects by assigning objects to properties", function (done) {
		var parents = {
				1: { id: 1, name: "Finn" }, 
				2: { id: 2, name: "Jake" }, 
				3: { id: 3, name: "Beemo" },
			},
			mapper = { mapTo: "items", parentKey: "id", childKey: "character_id" };

		miss.mapObject(
			parents,
			{ id: 1, name: "Hat", character_id: 1 },
			mapper
		);

		miss.mapObject(
			parents,
			{ id: 2, name: "Grass Sword", character_id: 1 },
			mapper
		);

		assert.equal(parents[1].id, 1);
		assert.equal(parents[1].name, "Finn");
		assert.equal(parents[1].items.length, 2);
		assert.equal(parents[1].items[1].name, "Grass Sword");

		done();
	});
});
