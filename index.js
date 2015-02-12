// TO-DO, pointing to lib/builder.js
var Builder = require('./lib/builder');
var Parser = require('./lib/parser');

var MongoQueryBuilder = function(expression){
	return Builder.build(Parser.parse(expression));
}

module.export = MongoQueryBuilder;

//console.log(JSON.stringify(MongoQueryBuilder('!document.disabled && (document.status !== undefined && document.status == "OK") || user.isAdmin'), null, 2));