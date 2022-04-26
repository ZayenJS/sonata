"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("./constants");
class TemplateLoader {
    static _instance;
    _templatesPath = '';
    constructor() { }
    static getInstance() {
        if (!TemplateLoader._instance) {
            TemplateLoader._instance = new TemplateLoader();
        }
        return TemplateLoader._instance;
    }
    get templatesPath() {
        return this._templatesPath;
    }
    setTemplatesPath(templatesPath) {
        this._templatesPath = templatesPath;
        return this;
    }
    load(templateName, extensions = constants_1.EXTENSIONS) {
        const extensionRegex = new RegExp(`\\.${extensions.join('|')}$`);
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
        return templateContent;
    }
}
exports.default = TemplateLoader.getInstance();
