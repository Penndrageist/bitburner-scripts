//Covers the whole screen in a blank square. When the mouse moves 
//over it, the square disappears and the command is executed.
export function inject(ns, code) {
    let id = '' + Math.random() + Math.random();
    let output = `<div id="${id}" style="position:absolute; width: 100%; height:100%"`;
    output += ` onmouseover="${code} document.getElementById('${id}').remove();"></div>`
    ns.tprint(output);
}

export function cmd(ns, cmd) {
    let code = `document.getElementById('terminal-input-text-box').value = '${cmd}'; document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, keyCode: 13 }));`
    inject(ns, code);
}

let asObj = (name = 'home', depth = 0) => ({name: name, depth: depth});
export function getServers(ns) {
    let result = [asObj()];
    let visited = { 'home': 0 };
    let queue = Object.keys(visited);
    let name;
    while ((name = queue .pop())) {
        let depth = visited[name] + 1;
        ns.scan(name).forEach(res => {
            if (!visited[res]) {
                queue.push(res);
                visited[res] = depth;
                result.push(asObj(res, depth));
            }
        });
    }
    return result;
}