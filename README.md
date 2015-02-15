# Mongo Query Generator
Generate query object for mongodb or mongoose from JavaScript predicate

```
var mqg = require('mongo-query-generator');
var query = mqg('(a || !b) && c === "OK"');

console.log(JSON.stringify(query, null , 2));
```

```
{
  "$and": [
    {
      "$or": [
        {
          "a": true
        },
        {
          "b": false
        }
      ]
    },
    {
      "c": "OK"
    }
  ]
}
```
## Installation
```
npm install mongo-query-generator
```

## Examples

```

mqg('!a') => {"a": false})
mqg('a!="1"') => {a : {'$ne' : '1'}}
mqg('a == null') => {"a": null}
mqg('a == undefined') => {"a": { '$exists' : false}}
mqg('a > 1') => {a : {'$gt' : 1}}
mqg('a || b && c') => {'$or' : [{'a' : true},{ '$and' : [{'b': true},{'c': true}]}]}
mqg('(a || b) && c') => {'$and' : [{ '$or' : [{'a': true},{'b': true}]}, {c : true}]}


```

## Tests
```
npm install
npm test
```
