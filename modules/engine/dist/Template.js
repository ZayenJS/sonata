"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Template = void 0;
const TemplateFunctions_1 = __importDefault(require("./TemplateFunctions"));
const TemplateParser_1 = require("./TemplateParser");
const utils_1 = require("./utils");
class Template {
    _isCompiled = false;
    _template;
    _parsedTemplate = '';
    _compiledTemplate;
    _delimiters;
    _data = {};
    _templateParser;
    constructor(template, delimiters, options) {
        this._template = template;
        this._delimiters = delimiters;
        this._data = options.data || {};
        this._templateParser = new TemplateParser_1.TemplateParser(this._delimiters, this._data);
    }
    addData(data) {
        this._data = { ...this._data, ...data };
        return this;
    }
    get data() {
        return Object.freeze(this._data);
    }
    modifyData(key, value) {
        this._data[key] = value;
        return this;
    }
    deleteData(key) {
        if (!key) {
            this._data = {};
            return this;
        }
        delete this._data[key];
        return this;
    }
    render(data = this._data) {
        if (!this._compiledTemplate) {
            this.compile(data);
        }
        const { range } = TemplateFunctions_1.default.getAll();
        // @ts-expect-error - at that point we know that this._compiledTemplate is defined
        return this._compiledTemplate(...Object.values(data), utils_1.escape, { linenb: 1 }, range);
    }
    compile(data = this._data) {
        if (this._isCompiled) {
            return this;
        }
        if (!this._parsedTemplate)
            this._parse();
        try {
            this._compiledTemplate = new Function(...Object.keys(data), 'escape', 'stack', 'range', this._parsedTemplate);
        }
        catch (error) {
            console.log({ error });
        }
        return this;
    }
    _parse() {
        if (!this._template) {
            throw new Error('Template is empty');
        }
        const parsedTemplate = this._templateParser.setTemplate(this._template).parse();
        this._parsedTemplate = parsedTemplate;
        this._isCompiled = true;
    }
}
exports.Template = Template;
