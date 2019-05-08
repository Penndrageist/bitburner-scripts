function processExpression(expression)
{
    // "17+45*7-18"
    var numbers = expression.split(/[+,\-,*]/g);    // ["17","45","7","18"]
    var operators = expression.split(/\d+/g);       // ["",+,*,-,""]
    
    if(operators.length > 0)
    {
        operators.splice(0, 1);
        operators.splice(operators.length - 1, 1);
    }
    
    var exprAsArr = [];

    while(operators.length > 0 || numbers.length > 0)
    {
        if(numbers.length > 0) exprAsArr.push(numbers.shift());
        if(operators.length > 0) exprAsArr.push(operators.shift());
    }
    
    while(exprAsArr.length > 1)
    {
        var iMul = exprAsArr.indexOf("*");
        
        if(iMul == -1) 
        {
            iMul = 1;
        }
        
        var lhs = Number(exprAsArr[iMul - 1]);
        var rhs = Number(exprAsArr[iMul + 1]);
        var op = exprAsArr[iMul];

        var res = -1;

        if(op == "+")
        {
            res = lhs + rhs;
        }
        else if(op == "-")
        {
            res = lhs - rhs;
        }
        else if(op == "*")
        {
            res = lhs * rhs;
        }

        exprAsArr.splice(iMul - 1, 3, res);
    }

    return exprAsArr[0];
}

async function generateExpressions(target, list, buildingExpr, remainingStr, ns = null)
{
    if(ns !== null) await ns.sleep(1);
    
    if(remainingStr === undefined || remainingStr === null) remainingStr = "";
    
    buildingExpr += "";
    remainingStr += "";
    
    if(remainingStr.length === 0)
    {
        var processed = processExpression(buildingExpr);
        
        if(processed == target)
        {
            list.push(buildingExpr);
        }
        
        return;
    }
    
    var remString = remainingStr.substring(1);
    if(remString === undefined || remString === null)
        remString = "";
    
    await generateExpressions(target, list, buildingExpr.concat(remainingStr[0]), remString, ns);
    await generateExpressions(target, list, buildingExpr.concat("+",remainingStr[0]), remString, ns);
    await generateExpressions(target, list, buildingExpr.concat("-",remainingStr[0]), remString, ns);
    await generateExpressions(target, list, buildingExpr.concat("*",remainingStr[0]), remString, ns);
}

export async function findAllValidMathExpressions(data, ns = null)
{
    var str = data[0]+"";
    var target = parseInt(data[1], 10);

    var list = [];
    
    await generateExpressions(target, list, str[0], str.substring(1), ns);

    return list;
}