import {
    cmd,
    getServers
} from "helper-scan.ns";

let facServers = {
    "CSEC": true,
    "avmnite-02h": true,
    "I.I.I.I": true,
    "run4theh111z": true
};

export async function main(ns) {
    let output = "Network:";
    getServers(ns).forEach(server => {
        let name = server.name;
        let hackColor = ns.hasRootAccess(name) ? "lime" : "red";
        let nameColor = facServers[name] ? "yellow" : "white";

        output += "<br>" + " ".repeat(server.depth);
        output += `<font color=${hackColor}>■ </font>`;
        output += ` <a class='scan-analyze-link' style='color:${nameColor}'>${name}</a> `;
        output += "<font color='fuchisa'>" + "©".repeat(ns.ls(name, ".cct").length) + "</font>";
    });
    ns.tprint(output);
    cmd(ns, 'scan-analyze 0');
}