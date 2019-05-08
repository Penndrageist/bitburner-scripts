export class Log {

    constructor(ns) {
        this.ns = ns;
        this.data = [''];
    }

    set(index, text) {
        while (this.data.length <= index)
            this.data.push('');
        this.data[index] = text;
        return this;
    }

    display() {
        this.ns.clearLog();
        this.ns.print(this.data.join('<br>'));
    }

}