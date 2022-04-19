"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateEngine = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Template_1 = require("./Template");
class TemplateEngine {
    templatesPath;
    // TODO?: add options
    constructor(templatesPath) {
        this.templatesPath = templatesPath;
    }
    createTemplate(templateName, data) {
        const extensionRegex = /sonata(?:.html)?$/;
        let templateContent = '';
        // if the extension is missing, read
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
        return new Template_1.Template(templateContent, data);
    }
}
exports.TemplateEngine = TemplateEngine;
const templateEngine = new TemplateEngine(path_1.default.join(__dirname, '..', 'views'));
// TODO: handle not found error
const template = templateEngine.createTemplate('home/index');
console.log(template.render({
    word: 'World',
    text: 'lorem ipsum dolor sit amet',
    name: 'John',
    email: 'john@test.com',
    password: 'null',
}));
