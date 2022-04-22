import path from 'path';

import { GenericObject, Template } from './Template';
import { TemplateLoader } from './TemplateLoader';

export type DelimiterName =
  | 'OPEN'
  | 'CLOSE'
  | 'START_INTERPRETATION'
  | 'END_INTERPRETATION'
  | 'COMMENT'
  | 'CONTROL'
  | 'INCLUDE';

export type Delimiter = {
  [key in DelimiterName]: string;
};

interface TemplateEngineOptions {
  delimiters?: Partial<Delimiter>;
  cache?: string | null;
  data?: GenericObject;
}

const DEFAULT_DELIMITERS = {
  OPEN: '{',
  CLOSE: '}',
  START_INTERPRETATION: `{`,
  END_INTERPRETATION: `}`,
  COMMENT: `#`,
  CONTROL: `%`,
  INCLUDE: `@`,
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

  public createTemplate(templateName: string, data: GenericObject = {}) {
    const loader = new TemplateLoader(this.templatesPath);
    const templateContent = loader.load(templateName, this._possibleExtensions);

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
  framework: 'Sonata',
  items: ['item 1', 'item 2', 'item 3'],
  number: 1,
};

const templateEngine = new TemplateEngine(path.join(__dirname, '..', 'views'));
// TODO: handle not found error
const template = templateEngine.createTemplate('home/index', data); // the template will use the data passed in the constructor
template.compile(); // render will be faster if you compile the template before rendering
template.render(); // compiles the template if it hasn't been compiled yet and renders it
