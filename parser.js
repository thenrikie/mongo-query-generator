/*
<expression>  ::=  <term> [ || <term> ]...
<term>  ::=  <factor> [ && <factor> ]...
<factor>  ::=  <cond>  |  "(" <expression> ")"
<cond> ::= [ "!" ] <varname> | <varname> [("!=="|"==="|"=="|"!=")] <varname>]
<varname> :== a-zA-Z_ [<varbody>]
<varbody> :== $_-a-zA-Z0-9 [<varbody>]
*/

function parseExpression(s){
    var o = parseTerm(s);
    s = o.s.trim();
    var n = o.t;

    var t = { childs : [n]};

    while (s.substr(0,2) === "||"){
      t.content = "||";
      s = s.substr(2);
      o = parseTerm(s);
      s = o.s.trim();
      n = o.t;
      t.childs.push(n);
    }

    if (!t.content){
        t = n;
    }
  
    return {t: t, s: s};
}


function parseTerm(s){
    
    s = s.trim();
    var o = parseFactor(s);
    s = o.s.trim();
    var n = o.t;
    var t = { childs : [n] };
    
    while(s.substr(0,2) === '&&'){
        t.content = '&&';
        s = s.substr(2);
        o = parseFactor(s);
        s = o.s.trim();
        n = o.t
        t.childs.push(n);
    }
  
    if (!t.content){
        t = n;
    }

    return {t: t, s: s};
}

function parseFactor(s){
    s = s.trim();
    var o;
    if (s.substr(0,1) === '('){
        s = s.substr(1);
        o = parseExpression(s);
        s = o.s.trim();
        // remove the close backet )
        if (s.substr(0,1) !== ')') {
            throw new Error('missing )');
            return null;
        }
        s = s.substr(1);
    } else if (s.substr(0,1) === ')') {
        throw new Error('extra )');
        return null;
    } else {
        o = parseVar(s);
        s = o.s;
    }
  
    return {s:s, t: o.t}
}

function parseCond(s){
    s = s.trim();
    var t = { content: ''};
    
    if (s.substr(0,1) === '!'){
        t.content = "!";
        s = s.substr(1);
    }
  
    var o = parseVarName(s);
    s = o.s;
    t.content += o.ms.trim();
  
    return {t: t, s: s};
  

}

function parseVarName(s){
    s = s.trim();
    var ms;
    if(s.substr(0,1).match(/[a-zA-Z_]/)){
        ms = s.substr(0,1);
        s = s.substr(1);
    } else {
        throw new Error('invalid variable name');
        return null;
    }
  
    return {s : s, ms : ms};
}

function parseVar(s){
    s = s.trim();
    var t = {};
    t.content = s.substr(0,1);
    s = s.substr(1);
    return {t: t, s: s};
}

// test case
parseExpression('a || b && (c || d)');
//parseExpression('a');
