"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateEngine = void 0;
const path_1 = __importDefault(require("path"));
const constants_1 = require("./constants");
const Template_1 = require("./Template");
const TemplateLoader_1 = __importDefault(require("./TemplateLoader"));
const DEFAULT_DELIMITERS = {
    OPEN: '{',
    CLOSE: '}',
    START_INTERPRETATION: `{`,
    END_INTERPRETATION: `}`,
    COMMENT: `#`,
    CONTROL: `%`,
    INCLUDE: `@`,
};
class TemplateEngine {
    templatesPath;
    _possibleExtensions = constants_1.EXTENSIONS;
    _delimiters = DEFAULT_DELIMITERS;
    _cache;
    constructor(templatesPath, options = {}) {
        this.templatesPath = templatesPath;
        this._delimiters = { ...this._delimiters, ...options.delimiters };
        this._cache = options.cache ?? null;
    }
    createTemplate(templateName, data = {}) {
        const loader = TemplateLoader_1.default.setTemplatesPath(this.templatesPath);
        const templateContent = loader.load(templateName, this._possibleExtensions);
        return new Template_1.Template(templateContent, this._delimiters, {
            data: data ?? {},
            cache: this._cache,
            delimiters: this._delimiters,
        });
    }
    addNewExtension(extension) {
        this._possibleExtensions.push(extension);
    }
}
exports.TemplateEngine = TemplateEngine;
const data = {
    word: 'World',
    text: 'lorem ipsum dolor sit amet',
    name: 'John',
    email: 'john@test.com',
    password: null,
    framework: 'Sonata',
    items: ['item 1', 'item 2', 'item 3'],
    number: 1,
    btnType: 'submit',
};
const templateEngine = new TemplateEngine(path_1.default.join(__dirname, '..', 'views'));
// TODO: handle not found error
const template = templateEngine.createTemplate('home/index', data); // the template will use the data passed in the constructor
template.compile(); // render will be faster if you compile the template before rendering
const renderedTemplate = template.render(); // compiles the template if it hasn't been compiled yet and renders it
// console.log('=========================================');
// console.log(renderedTemplate);
// console.log('=========================================');
