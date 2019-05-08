export function getFiles() {
    return [
        'manual/update.js',
        'manual/scan.js',
        'manual/overview.js',

        'helper.js',
        'primes.js',
        'Runner.js',

        'contract.js',
        'stock.js',
        'crack.js',

        'hack/autohack.js',
        'hack/hack.js',
        'hack/calculator.js',
        'hack/hack.script',
        'hack/grow.script',
        'hack/weaken.script',
    ];
}

export function inject(ns, code) {
    let id = ("" + Math.random() + Math.random()).replace(/\./g, '');
    let output = `<div id='${id}' style="position:absolute; width: 100%; height:100%" onmouseenter="if (typeof inject_${id} !== 'undefined') return;inject_${id} = true;document.getElementById('${id}').remove();${code}"></div>`;
    ns.tprint(output);
}

export function cmd(ns, cmd) {
    let code = `
        document.getElementById('terminal-input-text-box').value = '${cmd}';
        document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, keyCode: 13 }));
    `;
    inject(ns, code);
}

export function getArgs(ns) {
    if (ns.args.length === 1)
        return ns.args[0].split(';');
    return ns.args;
}

/**
 * Given percentage(s) in decimal format (i.e 1 => 100%)
 * @param {number|number[]} numbers
 * @param {number} decimals
 * @param {boolean} usePadding
 * @returns {string|string[]}
 */
export function asPercent(numbers, decimals = 1, usePadding = true) {
    let isArray = Array.isArray(numbers);
    if (!isArray) numbers = [numbers];
    let percents = numbers.map(n => (n * 100).toFixed(decimals) + '%');
    if (usePadding) {
        let max = Math.max(...(percents.map(n => n.length)));
        percents = percents.map(n => n.padStart(max, ' '));
    }
    return isArray ? percents : percents[0];
}

let units = [' ', 'k', 'm', 'b', 't', 'q', 'Q', 's', 'S'];

/**
 * Given big numbers convert to readable, defaults to 2 decimals
 * Fx 1.400.000 => 1.40m
 * If given array converts according to biggest number in array
 * Fx [10.000, 1.000.000] => [0.01m, 1.00m]
 * Handles up to Septillion (10^24)
 * @param {number|number[]} numbers
 * @param {number} decimals
 * @param {boolean} usePadding
 * @returns {string|string[]}
 */
export function asFormat(numbers, decimals = 2, usePadding = true) {
    let isArray = Array.isArray(numbers);
    if (!isArray) numbers = [numbers];
    let biggest = Math.max(...(numbers.map(Math.abs)));
    let unit = 0;
    for (; biggest >= 1000; unit++, biggest /= 1000) {
    }
    let div = Math.pow(10, Math.min(unit, units.length - 1) * 3);
    let formatted = numbers.map(n => (n / div).toFixed(decimals) + units[unit]);
    if (usePadding) {
        let longest = Math.max(...(formatted.map(n => n.length)));
        formatted = formatted.map(n => n.padStart(longest, ' '))
    }
    return isArray ? formatted : formatted[0];
}

let ServerType = {
    'Own': 'Own',
    'Shop': 'Shop',
    'Faction': 'Faction',
    'MoneyFarm': 'MoneyFarm',
    'Target': 'Target'
};
let getServerType = (ns, name) => {
    // Assumes all owned servers are called 'home...'
    if (name.startsWith('home'))
        return ServerType.Own;
    switch (name) {
        case 'darkweb':
            return ServerType.Shop;
        case 'CSEC':
        case 'avmnite-02h':
        case 'I.I.I.I':
        case 'run4theh111z':
            return ServerType.Faction;
        case 'The-Cave':
        case 'w0r1d_d43m0n':
            return ServerType.Target;
        default:
            return ServerType.MoneyFarm;
    }
};


export class Server {
    /**
     * @param {Ns} ns
     * @returns {Server[]}
     */
    static get(ns) {
        let visited = {'home': true};
        let servers = [];
        let queue = [new Server(ns, 'home')];
        while (queue.length > 0) {
            let curr = queue.pop();
            servers.push(curr);
            let depth = curr.depth + 1;
            ns.scan(curr.name).forEach(name => {
                if (!visited[name]) {
                    let server = new Server(ns, name, depth);
                    queue.push(server);
                    visited[name] = true;
                }
            });
        }
        return servers;
    }

    static create(ns, name) {
        return new Server(ns, name);
    }

    static types(){
        return ServerType;
    }

    /**
     * @param {Ns} ns
     * @param {string} name
     * @param {number} depth
     */
    constructor(ns, name, depth = 0) {
        this.type = getServerType(ns, name);
        this.ns = ns;
        this.name = name;
        this.depth = depth
    }

    /**
     * @returns {number}
     */
    get moneyAvail() {
        return this.ns.getServerMoneyAvailable(this.name);
    }

    /**
     * @returns {number}
     */
    get moneyMax() {
        return this.ns.getServerMaxMoney(this.name);
    }

    /**
     * @returns {boolean}
     */
    get hasMaxMoney() {
        return this.moneyAvail === this.moneyMax;
    }

    /**
     * @returns {number}
     */
    get securityMin() {
        return this.ns.getServerMinSecurityLevel(this.name);
    }

    /**
     * @returns {number}
     */
    get securityCurr() {
        return this.ns.getServerSecurityLevel(this.name);
    }

    /**
     * @returns {boolean}
     */
    get hasMinSecurity() {
        return this.securityCurr === this.securityMin;
    }

    /**
     * @returns {boolean}
     */
    get hasRoot() {
        return this.ns.hasRootAccess(this.name);
    }

    get levelNeeded() {
        return this.ns.getServerRequiredHackingLevel(this.name);
    }

    /**
     * @param {number} crackingScripts
     * @returns {boolean}
     */
    canCrack(crackingScripts) {
        if (this.hasRoot)
            return false;
        let ports = this.ns.getServerNumPortsRequired(this.name);
        if (ports > crackingScripts)
            return false;
        return this.levelNeeded <= this.ns.getHackingLevel();
    }

    /**
     * @param {string[]} availableCrackingScripts
     * @returns {boolean} success of cracking
     */
    crack(availableCrackingScripts) {
        if (this.hasRoot)
            return true;
        if (!this.canCrack(availableCrackingScripts.length))
            return false;
        availableCrackingScripts.forEach(script => {
            switch (script) {
                case 'httpworm':
                case 'httpworm.exe':
                    this.ns.httpworm(this.name);
                    break;
                case 'sqlinject':
                case 'sqlinject.exe':
                    this.ns.sqlinject(this.name);
                    break;
                case 'ftpcrack':
                case 'ftpcrack.exe':
                    this.ns.ftpcrack(this.name);
                    break;
                case 'relaysmtp':
                case 'relaysmtp.exe':
                    this.ns.relaysmtp(this.name);
                    break;
                case 'brutessh':
                case 'brutessh.exe':
                    this.ns.brutessh(this.name);
                    break;
            }
        });
        this.ns.nuke(this.name);
        return true;
    }
}