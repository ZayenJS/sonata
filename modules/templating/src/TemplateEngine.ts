import fs from 'fs';
import path from 'path';

import { GenericObject, Template } from './Template';

export type DelimiterName =
  | 'OPEN'
  | 'CLOSE'
  | 'START_INTERPRETATION'
  | 'END_INTERPRETATION'
  | 'START_COMMENT'
  | 'END_COMMENT'
  | 'START_CONTROL'
  | 'END_CONTROL'
  | 'START_INCLUDE'
  | 'END_INCLUDE';

export type Delimiter = {
  [key in DelimiterName]: string;
};

interface TemplateEngineOptions {
  delimiters?: Partial<Delimiter>;
  cache?: string | null;
  data?: GenericObject;
}

const OPEN_TAG = '{';
const CLOSE_TAG = '}';

const DEFAULT_DELIMITERS = {
  OPEN: OPEN_TAG, //- {
  CLOSE: CLOSE_TAG, //- }
  START_INTERPRETATION: `${OPEN_TAG}{`, //- {{
  END_INTERPRETATION: `}${CLOSE_TAG}`, //- }}
  START_COMMENT: `${OPEN_TAG}#`, //- {#
  END_COMMENT: `#${CLOSE_TAG}`, //- #}
  START_CONTROL: `${OPEN_TAG}%`, //- {%
  END_CONTROL: `%${CLOSE_TAG}`, //- %}
  START_INCLUDE: `${OPEN_TAG}@`, //- {@
  END_INCLUDE: `@${CLOSE_TAG}`, //- @}
};

export class TemplateEngine {
  private _possibleExtensions = ['.sonata', '.sonata.html'];
  private _delimiters: Delimiter = DEFAULT_DELIMITERS;
  private _cache;

  public constructor(
    private readonly templatesPath: string,
    options: TemplateEngineOptions = {},
  ) {
    this._delimiters = { ...this._delimiters, ...options.delimiters };
    this._cache = options.cache ?? null;
  }

  public createTemplate(templateName: string, data?: GenericObject) {
    const extensionRegex = new RegExp(`\\.${this._possibleExtensions.join('|')}$`);
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

    return new Template(templateContent, this._delimiters, {
      data: data ?? {},
      cache: this._cache,
      delimiters: this._delimiters,
    });
  }

  public addNewExtension(extension: string) {
    this._possibleExtensions.push(extension);
  }
}

const data = {
  word: 'World',
  text: 'lorem ipsum dolor sit amet',
  name: 'John',
  email: 'john@test.com',
  password: null,
};

const templateEngine = new TemplateEngine(path.join(__dirname, '..', 'views'));
// TODO: handle not found error
const template = templateEngine.createTemplate('home/index', data); // the template will use the data passed in the constructor
template.compile(); // render will be faster if you compile the template before rendering
console.log(template.render()); // compiles the template if it hasn't been compiled yet and renders it
