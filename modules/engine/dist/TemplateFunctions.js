"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TemplateFunctions {
    static _instance;
    constructor() { }
    static getInstance() {
        if (!this._instance) {
            this._instance = new TemplateFunctions();
        }
        return this._instance;
    }
    getAll() {
        return {
            range: this.range,
        };
    }
    get(name) {
        return this[name];
    }
    range(start, end, step) {
        const range = [];
        let index = start;
        if (end === undefined) {
            end = start;
            start = 0;
        }
        if (step === undefined) {
            step = start < end ? 1 : -1;
        }
        while (index >= start && index <= end) {
            range.push(index);
            index += step;
        }
        return range;
    }
}
exports.default = TemplateFunctions.getInstance();
