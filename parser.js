/*
<expression>  ::=  <term> *( || <term> )
<term>  ::=  <factor> *( && <factor> )
<factor>  ::=  <pred>  |  "(" <expression> ")"
<pred> ::= [!] <var> | <var> (!==|===|==|!=|>=|<=|>|<) ("<string>" | '<string>' | <number> | true | false | null)
<var> ::= {a-zA-Z_} *({$_-a-zA-Z0-9})
<string> ::= "" | {.} *(<string>)
<number> ::= [-] 1*({0-9}) ["." 1*({0-9})]
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
        o = parsePred(s);
        s = o.s;
    }
  
    return {s:s, t: o.t}
}

function parsePred(s){
    s = s.trim();
    var t = { content: ''};
    
    if (s.substr(0,1) === '!'){
        t.content = "!";
        s = s.substr(1);
    }
  
    var o = parseVar(s);
    s = o.s.trim();

    if (o.ms.trim() === "") {
        throw new Error('missing LHS variable');
    }
    t.content += o.ms.trim();
       
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
        t.content += comp;
        
        var o;
        
        s = s.trim();
        if(s.substr(0,1) === "'"){
            s = s.substr(1);
            o = parseString(s, "'");
            s = o.s.trim();
            if (s.substr(0,1) !== "'"){
                throw new Error("missing closing '");
            }
            s = s.substr(1);
            o.ms = "'" + o.ms.trim() + "'";
        } else if (s.substr(0,1) === "\""){
            s = s.substr(1);
            o = parseString(s, "\"");
            s = o.s.trim();
            if (s.substr(0,1) !== "\""){
                throw new Error("missing closing \"");
            }
            s = s.substr(1);
            o.ms = "\"" + o.ms.trim() + "\"";
        } else if (s.substr(0,4) === "true" || s.substr(0,4) === "null"){
            s = s.substr(4);
            o.ms = s.substr(0,4);
        } else if (s.substr(0,5) === "false"){
            s = s.substr(5);
            o.ms = "false";
        } else {
            o = parseNumber(s);
            s = o.s;
        }
        
        
        


        t.content += o.ms.trim();        
    }
    
    return {t: t, s: s};
  

}

function parseVar(s){
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
        throw new Error('invalid variable name');
        return null;
    }
  
    return {s : s, ms : ms};
}


function parseString(s, stopChar){
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
    return {s: s, ms: ms}
}

function parseNumber(s){

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

    return {s: s, ms: ms}
}

// test case
parseExpression('!document.disabled && (document.status === null || document.status == "OK") || user.isAdmin');
//parseExpression('a');
