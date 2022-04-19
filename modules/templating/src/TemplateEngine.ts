import fs from 'fs';
import path from 'path';

import { Template } from './Template';

export class TemplateEngine {
  // TODO?: add options
  public constructor(private readonly templatesPath: string) {}

  public createTemplate(templateName: string, data?: { [key: string]: string }) {
    const extensionRegex = /sonata(?:.html)?$/;
    let templateContent = '';

    // if the extension is missing, read
    if (!extensionRegex.test(templateName)) {
      const splitted = templateName.split('/');
      const fileName = splitted.pop();
      const directory = splitted.join('/');
      const content = fs.readdirSync(path.join(this.templatesPath, directory), {
        encoding: 'utf-8',
      });

      const templateFileName = content.find(file => file.includes(fileName ?? ''));

      if (!templateFileName) throw new Error(`Template ${templateName} not found`);

      templateName = path.join(directory, templateFileName);
    }

    const templatePath = path.join(this.templatesPath, templateName);

    templateContent = fs.readFileSync(templatePath, { encoding: 'utf-8' });
    if (!templateContent) throw new Error(`Template ${templateName} not found`);

    return new Template(templateContent, data);
  }
}

const templateEngine = new TemplateEngine(path.join(__dirname, '..', 'views'));
// TODO: handle not found error
const template = templateEngine.createTemplate('home/index');

console.log(
  template.render({
    word: 'World',
    text: 'lorem ipsum dolor sit amet',
    name: 'John',
    email: 'john@test.com',
    password: 'null',
  }),
);
