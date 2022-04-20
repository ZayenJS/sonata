"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateEngine = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Template_1 = require("./Template");
const OPEN_TAG = '{';
const CLOSE_TAG = '}';
const DEFAULT_DELIMITERS = {
    OPEN: OPEN_TAG,
    CLOSE: CLOSE_TAG,
    START_INTERPRETATION: `${OPEN_TAG}{`,
    END_INTERPRETATION: `}${CLOSE_TAG}`,
    START_COMMENT: `${OPEN_TAG}#`,
    END_COMMENT: `#${CLOSE_TAG}`,
    START_CONTROL: `${OPEN_TAG}%`,
    END_CONTROL: `%${CLOSE_TAG}`,
    START_INCLUDE: `${OPEN_TAG}@`,
    END_INCLUDE: `@${CLOSE_TAG}`, //- @}
};
class TemplateEngine {
    templatesPath;
    _possibleExtensions = ['.sonata', '.sonata.html'];
    _delimiters = DEFAULT_DELIMITERS;
    _cache;
    constructor(templatesPath, options = {}) {
        this.templatesPath = templatesPath;
        this._delimiters = { ...this._delimiters, ...options.delimiters };
        this._cache = options.cache ?? null;
    }
    createTemplate(templateName, data) {
        const extensionRegex = new RegExp(`\\.${this._possibleExtensions.join('|')}$`);
        let templateContent = '';
        // if the extension is missing, read the directory and try to find the file
        if (!extensionRegex.test(templateName)) {
            const splitted = templateName.split('/');
            const fileName = splitted.pop();
            const directory = splitted.join('/');
            const content = fs_1.default.readdirSync(path_1.default.join(this.templatesPath, directory), {
                encoding: 'utf-8',
            });
            const templateFileName = content.find(file => file.includes(fileName ?? ''));
            if (!templateFileName)
                throw new Error(`Template ${templateName} not found`);
            templateName = path_1.default.join(directory, templateFileName);
        }
        const templatePath = path_1.default.join(this.templatesPath, templateName);
        templateContent = fs_1.default.readFileSync(templatePath, { encoding: 'utf-8' });
        if (!templateContent)
            throw new Error(`Template ${templateName} not found`);
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
};
const templateEngine = new TemplateEngine(path_1.default.join(__dirname, '..', 'views'));
// TODO: handle not found error
const template = templateEngine.createTemplate('home/index', data); // the template will use the data passed in the constructor
template.compile(); // render will be faster if you compile the template before rendering
console.log(template.render()); // compiles the template if it hasn't been compiled yet and renders it
