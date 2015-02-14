var MongoQueryBuilder = require('../index');
var assert = require('chai').assert;

describe('MongoQueryBuilder', function(){
	it('should return empty Object when falsy or true keyword or spaces is given', function(){
		assert.deepEqual(MongoQueryBuilder(''), {});
		assert.deepEqual(MongoQueryBuilder(null), {});
		assert.deepEqual(MongoQueryBuilder('  '), {});
		assert.deepEqual(MongoQueryBuilder(false), {});
		assert.deepEqual(MongoQueryBuilder(undefined), {});
		assert.deepEqual(MongoQueryBuilder(true), {});
	});

	it('should return {field: true} object when signle variable is given', function(){
		assert.deepEqual(MongoQueryBuilder('a'), {"a": true});
	});

	it('should return {field: false} object when !variable is given', function(){
		assert.deepEqual(MongoQueryBuilder('!a'), {"a": false});
	});

	it('should return {field: false} object when !variable is given', function(){
		assert.deepEqual(MongoQueryBuilder('!a'), {"a": false});
	});

	it('should return {field: $exists: { field : true }} object when variable != undefined is given', function(){
		assert.deepEqual(MongoQueryBuilder('a != undefined'), {"a": { '$exists' : true}});
	});

	it('should return {field: $exists: { field : false }} object when variable == undefined is given', function(){
		assert.deepEqual(MongoQueryBuilder('a == undefined'), {"a": { '$exists' : false}});
	});

	it('extra barket should work ((variable))', function(){
		assert.deepEqual(MongoQueryBuilder('((a))'), {"a": true});
	});

	it('should work with || operator', function(){
		assert.deepEqual(MongoQueryBuilder('a || b'), {'$or' : [{a : true}, {b: true}] });
		assert.deepEqual(MongoQueryBuilder('a || b || c'), {'$or' : [{a : true}, {b: true}, {c: true}] });
	});

	it('should work with && operator', function(){
		assert.deepEqual(MongoQueryBuilder('a && b'), {'$and' : [{a : true}, {b: true}] });
		assert.deepEqual(MongoQueryBuilder('a && b && c'), {'$and' : [{a : true}, {b: true}, {c: true}] });
	});

	it('should able to tell between different data types like 1, 1.5, "1", true, "true", null, false', function(){
		assert.deepEqual(MongoQueryBuilder('a==1'), {a : 1});
		assert.deepEqual(MongoQueryBuilder('a> 1.5'), {a : {'$gt': 1.5}});
		assert.deepEqual(MongoQueryBuilder('a=="1"'), {a : '1'});
		assert.deepEqual(MongoQueryBuilder('a==true'), {a : true});
		assert.deepEqual(MongoQueryBuilder('a=="true"'), {a : 'true'});
		assert.deepEqual(MongoQueryBuilder('a==null'), {a : null});
		assert.deepEqual(MongoQueryBuilder('a==false'), {a : false});
	});

	it('should work with == or === operator', function(){
		assert.deepEqual(MongoQueryBuilder('a=="1"'), {a : '1'});
		assert.deepEqual(MongoQueryBuilder('a==true'), {a : true});
	});

	it('should work with != or !== operator', function(){
		assert.deepEqual(MongoQueryBuilder('a!="1"'), {a : {'$ne' : '1'}});
		assert.deepEqual(MongoQueryBuilder('a!==true'), {a : {'$ne' : true}});
	});

	it('should work with >= or > operator', function(){
		assert.deepEqual(MongoQueryBuilder('a > 1'), {a : {'$gt' : 1}});
		assert.deepEqual(MongoQueryBuilder('a >= 1'), {a : {'$gte' : 1}});
	});

	it('should work with <= or < operator', function(){
		assert.deepEqual(MongoQueryBuilder('a < 1'), {a : {'$lt' : 1}});
		assert.deepEqual(MongoQueryBuilder('a <= 1'), {a : {'$lte' : 1}});
	});


	it('should work with single and double quote', function(){
		assert.deepEqual(MongoQueryBuilder('a=="1"'), {a : '1'});
		assert.deepEqual(MongoQueryBuilder("a=='1'"), {a : '1'});
	});

	it('should work with string escape', function(){
		assert.deepEqual(MongoQueryBuilder('a=="\\"1"'), {a : '"1'});
		assert.deepEqual(MongoQueryBuilder("a=='\\'1'"), {a : "'1"});
	});

	it('should know  && has higher precedence then ||', function(){
		assert.deepEqual(MongoQueryBuilder('a || b && c'), {'$or' : [{'a' : true},{ '$and' : [{'b': true},{'c': true}]}]});
		assert.deepEqual(MongoQueryBuilder('b && c || a'), {'$or' : [{ '$and' : [{'b': true},{'c': true}]}, {'a' : true},]});
	});

	it('should know  ! has higher precedence then && and ||', function(){
		assert.deepEqual(MongoQueryBuilder('a || !b && c'), {'$or' : [{'a' : true},{ '$and' : [{'b': false},{'c': true}]}]});
	});

	it('should know  () has higher precedence then && and ||', function(){
		assert.deepEqual(MongoQueryBuilder('(a || b) && c'), {'$and' : [{ '$or' : [{'a': true},{'b': true}]}, {c : true}]});
		assert.deepEqual(MongoQueryBuilder('c && (a || b)'), {'$and' : [{c : true}, { '$or' : [{'a': true},{'b': true}]}]});
	});

	it('should throws an error if variable name start with invalid characters', function(){
		assert.throws(function() {MongoQueryBuilder('$a')});
		assert.throws(function() {MongoQueryBuilder('-a')});
		assert.throws(function() {MongoQueryBuilder('.a')});
		assert.throws(function() {MongoQueryBuilder('0a')});
		assert.throws(function() {MongoQueryBuilder('1.a')});
	});


	it('should throws an error if missing backets', function(){
		assert.throws(function() {MongoQueryBuilder('((a)')});
		assert.throws(function() {MongoQueryBuilder('(a')});
		assert.throws(function() {MongoQueryBuilder('a)')});
	});

	it('should throws an error if missing quote', function(){
		assert.throws(function() {MongoQueryBuilder('a=="1')});
		assert.throws(function() {MongoQueryBuilder('a==1"')});
	});

});