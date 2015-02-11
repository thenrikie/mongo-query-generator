'use strict';
/*
<expression>  ::=  <term> *( || <term> )
<term>  ::=  <factor> *( && <factor> )
<factor>  ::=  <pred>  |  "(" <expression> ")"
<pred> ::= [!] <var> | <var> (!==|===|==|!=|>=|<=|>|<) ("<string>" | '<string>' | <number> | true | false | null)
<var> ::= {a-zA-Z_} *({$_-a-zA-Z0-9})
<string> ::= "" | {.} *(<string>)
<number> ::= [-] 1*({0-9}) ["." 1*({0-9})]
*/
var Parser = {};

module.exports = Parser;

Parser.parse = function(exp){
    return Parser.parseExpression(exp);
};

Parser.parseExpression = function(s){
    var o = Parser.parseTerm(s);
    s = o.s.trim();
    var n = o.t;

    var t = { childs : [n]};

    while (s.substr(0,2) === "||"){
      t.content = "||";
      s = s.substr(2);
      o = Parser.parseTerm(s);
      s = o.s.trim();
      n = o.t;
      t.childs.push(n);
    }

    if (!t.content){
        t = n;
    }
  
    return {t: t, s: s};
};


Parser.parseTerm = function(s){
    
    s = s.trim();
    var o = Parser.parseFactor(s);
    s = o.s.trim();
    var n = o.t;
    var t = { childs : [n] };
    
    while(s.substr(0,2) === '&&'){
        t.content = '&&';
        s = s.substr(2);
        o = Parser.parseFactor(s);
        s = o.s.trim();
        n = o.t;
        t.childs.push(n);
    }
  
    if (!t.content){
        t = n;
    }

    return {t: t, s: s};
};

Parser.parseFactor = function(s){
    s = s.trim();
    var o;
    if (s.substr(0,1) === '('){
        s = s.substr(1);
        o = Parser.parseExpression(s);
        s = o.s.trim();
        // remove the close backet )
        if (s.substr(0,1) !== ')') {
            throw new Error('missing )');
        }
        s = s.substr(1);
    } else if (s.substr(0,1) === ')') {
        throw new Error('extra )');
    } else {
        o = Parser.parsePred(s);
        s = o.s;
    }
  
    return {s:s, t: o.t};
};

Parser.parsePred = function(s){
    s = s.trim();
    var t = { content: ''};
    
    if (s.substr(0,1) === '!'){
        t.content = "!";
        s = s.substr(1);
    }

  
    var o = Parser.parseVar(s);
    s = o.s.trim();

    if (o.ms.trim() === "") {
        throw new Error('missing LHS variable');
    }
    //t.content += o.ms.trim();
    t.childs = [{ content: o.ms.trim()}];

    var comp = "";
    if (s.substr(0,3) === "===" ||s.substr(0,3) === "!=="){
        comp = s.substr(0,3);   
        s = s.substr(3);
    } else if (s.substr(0,2) === "==" ||s.substr(0,2) === "!=" || s.substr(0,2) === ">=" || s.substr(0,2) === "<="){
        comp = s.substr(0,2); 
        s = s.substr(2);
    } else if (s.substr(0,1) === ">" || s.substr(0,1) === "<"){
        comp = s.substr(0,1); 
        s = s.substr(1);
    }
    
    if (comp !== ""){
        //t.content += comp;
        t.content = comp;
        
        
        s = s.trim();
        if(s.substr(0,1) === "'"){
            s = s.substr(1);
            o = Parser.parseString(s, "'");
            s = o.s.trim();
            if (s.substr(0,1) !== "'"){
                throw new Error("missing closing '");
            }
            s = s.substr(1);
            o.ms = "'" + o.ms.trim() + "'";
        } else if (s.substr(0,1) === "\""){
            s = s.substr(1);
            o = Parser.parseString(s, "\"");
            s = o.s.trim();
            if (s.substr(0,1) !== "\""){
                throw new Error("missing closing \"");
            }
            s = s.substr(1);
            o.ms = "\"" + o.ms.trim() + "\"";
        } else if (s.substr(0,4) === "true" || s.substr(0,4) === "null"){
            o.ms = s.substr(0,4);
            s = s.substr(4);
        } else if (s.substr(0,5) === "false"){
            s = s.substr(5);
            o.ms = "false";
        } else {
            o = Parser.parseNumber(s);
            s = o.s;
        }

        //t.content += o.ms.trim();     
        t.childs.push({ content: o.ms.trim()});
    }
    
    if (t.content === ""){
        t.content = t.childs[0].content;
        delete t.childs;
    }

    return {t: t, s: s};
  

};

Parser.parseVar = function(s){
    s = s.trim();
    var ms = "";
    if(s.substr(0,1).match(/[a-zA-Z_]/)){
        ms = s.substr(0,1);
        s = s.substr(1);

        while(s.substr(0,1).match(/[a-zA-Z_0-9$\.\-]/)){
            ms += s.substr(0,1);
            s = s.substr(1);
        }

    } else {
        throw new Error('invalid character in variable name');
    }
  
    return {s : s, ms : ms};
};


Parser.parseString = function(s, stopChar){
    var ms = "";
    while(s.substr(0,1) !== stopChar){
      if (s.substr(0,2) === '\\' + stopChar){
        ms += s.substr(0,2);
        s = s.substr(2);
      } else {
        ms += s.substr(0,1);
        s = s.substr(1);
      }
    }
    return {s: s, ms: ms};
};

Parser.parseNumber = function(s){

    s = s.trim();

    var ms = "";
    if(s.substr(0,1) === "-"){
        ms += "-";
        s = s.substr(1);
    }

    while(s.substr(0,1).match(/[0-9]/)){
        ms += s.substr(0,1);
        s = s.substr(1);
    }

    if (ms === '-' || ms.length === 0){
        throw new Error('parse RHS variable error');
    }

    if(s.substr(0,1) === "."){
        ms += ".";
        s = s.substr(1);

        var c = 0;
        while(s.substr(0,1).match(/[0-9]/)){
            ms += s.substr(0,1);
            s = s.substr(1);
            c++;
        }

        if (c === 0){
            throw new Error('parse number error');
        }
    }

    return {s: s, ms: ms};
};

// test case
//Parser.parse('!document.disabled && (document.status === null || document.status == "OK") || user.isAdmin');
//parseExpression('a');
