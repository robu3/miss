# Miss
## Query executor, object-mapper thingy for Node.js +(Mi)crosoft (S)QL (S)erver

I found myself using Node.js and SQL Server together in several projects, tied together with amazing [tedious module](https://github.com/pekim/tedious).
However, managing all of the connections and all that jazz quickly grew cumbersome, and while I wrote some light wrappers/helpers to
help, I quickly grew sick of all the copy-pasta.

At the same time, I was yearning for something a bit like [Dapper](https://github.com/StackExchange/dapper-dot-net): a thin SQL-query-to-object-array library to make working with the data a bit easier. My goal is not to port the exact code of any existing library, but to replicate the same sort of functionality.

Currently supported features:

- Query to object array
- Implicit (and explicit) input parameter data type assignment
- Map result set of a join to an object hierarchy

Todo items:

- Add connection pooling
- Other stuff I haven't thought of yet
