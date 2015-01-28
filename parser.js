/*
<expression>  ::=  <term> [ || <term> ]...
<term>  ::=  <factor> [ && <factor> ]...
<factor>  ::=  <cond>  |  "(" <expression> ")"
<cond> ::= [ "!" ] <varname> | <varname> [("!=="|"==="|"=="|"!=")] <varname>]
<varname> :== a-zA-Z0-9_ [<varbody>]
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

    return {t: t, s: s};
}

function parseFactor(s){
    s = s.trim();
    var t = {};
    t.content = s.substr(0,1);
    s = s.substr(1);
    return {t: t, s: s}
}

parseExpression('a || b && c || d');


