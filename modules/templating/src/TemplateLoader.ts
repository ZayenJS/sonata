import fs from 'fs';
import path from 'path';

export class TemplateLoader {
  public constructor(private readonly templatesPath: string) {}

  public load(templateName: string, extensions: string[]) {
    const extensionRegex = new RegExp(`\\.${extensions.join('|')}$`);
    let templateContent = '';

    // if the extension is missing, read the directory and try to find the file
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

    return templateContent;
  }
}
