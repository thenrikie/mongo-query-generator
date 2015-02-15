// TO-DO, pointing to lib/builder.js
var Builder = require('./lib/builder');
var Parser = require('./lib/parser');

var MongoQueryBuilder = function(expression){
	return Builder.build(Parser.parse(expression));
}

module.exports = MongoQueryBuilder;
