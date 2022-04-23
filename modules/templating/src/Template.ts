import { Delimiter } from './TemplateEngine';
import TemplateFunctions from './TemplateFunctions';
import { TemplateParser } from './TemplateParser';
import { escape } from './utils';

export interface GenericObject {
  [key: string]: any;
}

export type TemplateMode = 'interpretation' | 'comment' | 'control' | 'include';

export interface TemplateOptions {
  delimiters: Partial<Delimiter>;
  cache?: string | null;
  data?: GenericObject;
}

export class Template {
  private _isCompiled = false;
  private _template?: string;
  private _parsedTemplate: string = '';
  private _compiledTemplate?: Function;
  private _delimiters: Delimiter;
  private _data: GenericObject = {};
  private _templateParser: TemplateParser;

  public constructor(template: string, delimiters: Delimiter, options: TemplateOptions) {
    this._template = template;
    this._delimiters = delimiters;
    this._data = options.data || {};

    this._templateParser = new TemplateParser(this._delimiters, this._data);
  }

  public addData(data: GenericObject) {
    this._data = { ...this._data, ...data };

    return this;
  }

  public get data() {
    return Object.freeze(this._data);
  }

  public modifyData(key: string, value: string) {
    this._data[key] = value;

    return this;
  }

  public deleteData(): this;
  public deleteData(key?: string) {
    if (!key) {
      this._data = {};

      return this;
    }

    delete this._data[key];

    return this;
  }

  public render(data: GenericObject = this._data) {
    if (!this._compiledTemplate) {
      this.compile(data);
    }
    const { range } = TemplateFunctions.getAll();

    // @ts-expect-error - at that point we know that this._compiledTemplate is defined
    return this._compiledTemplate(...Object.values(data), escape, { linenb: 1 }, range);
  }

  public compile(data: GenericObject = this._data) {
    if (this._isCompiled) {
      return this;
    }

    if (!this._parsedTemplate) this._parse();

    try {
      this._compiledTemplate = new Function(
        ...Object.keys(data),
        'escape',
        'stack',
        'range',
        this._parsedTemplate,
      );
    } catch (error) {
      console.log({ error });
    }

    return this;
  }

  private _parse() {
    if (!this._template) {
      throw new Error('Template is empty');
    }

    const parsedTemplate = this._templateParser.setTemplate(this._template).parse();
    this._parsedTemplate = parsedTemplate;

    this._isCompiled = true;
  }
}
