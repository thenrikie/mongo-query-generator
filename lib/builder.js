'use strict';

//Query builder from the parse tree

var Builder = {
	build : function(tree){

		var query = {};

		var pushChild = function(op, childs){
			query[op] = [];
			childs.forEach(function(child){
				query[op].push(Builder.build(child));
			});
		};

     // console.log(tree.childs);
		if (tree.content === '||') {
			pushChild('$or', tree.childs);
		} else if (tree.content === '&&') {
			pushChild('$and', tree.childs);
		} else if (tree.content === '===' || tree.content === '==') {
			if (tree.childs[1].content === undefined){
				query[tree.childs[0].content] = { '$exists' : false };
			} else {
				query[tree.childs[0].content] = tree.childs[1].content;
			}
		} else if (tree.content === '!==' || tree.content === '!='){
			if (tree.childs[1].content === undefined){
				query[tree.childs[0].content] = { '$exists' : true };
			} else {
				query[tree.childs[0].content] = { '$ne' : tree.childs[1].content};
			}
		} else if (tree.content === '>'){
			query[tree.childs[0].content] = { '$gt' : tree.childs[1].content};
		} else if (tree.content === '>='){
			query[tree.childs[0].content] = { '$gte' : tree.childs[1].content};
		} else if (tree.content === '<'){
			query[tree.childs[0].content] = { '$lt' : tree.childs[1].content};
		} else if (tree.content === '<='){
			query[tree.childs[0].content] = { '$lte' : tree.childs[1].content};
		} else if (tree.content === '!'){
			query[tree.childs[0].content] = false;
		} else if(tree.content) {
			query[tree.content] = true;
		}
  
		return query;
	}
}

module.exports = Builder;