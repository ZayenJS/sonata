import { Delimiter } from './TemplateEngine';

export interface GenericObject {
  [key: string]: any;
}

export type TemplateMode = 'interpretation' | 'comment' | 'control' | 'include';

export interface TemplateOptions {
  delimiters: Partial<Delimiter>;
  cache?: string | null;
  data?: GenericObject;
}

enum AddContentType {
  ADD = 1,
  SKIP_UNTIL_NEXT_BLOCK,
  ADD_UNTIL_NEXT_BLOCK,
  SKIP_UNTIL_ENDIF,
}

const START_KEYWORDS = ['if', 'elseif', 'else if', 'elif', 'else', 'for', 'while'];

const END_KEYWORDS = ['endif', 'endfor', 'endwhile'];

export class Template {
  private _isCompiled = false;
  private _template?: string;
  private _parsedTemplate: string[] = [];
  private _delimiters: Delimiter;
  private _data: GenericObject = {};

  public constructor(template: string, delimiters: Delimiter, options: TemplateOptions) {
    this._template = template;
    this._delimiters = delimiters;
    this._data = options.data || {};
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
    console.time('render');
    if (this._template && !this._isCompiled) {
      this.compile(data);
    }

    console.timeEnd('render');
    return this._parsedTemplate.join('\n');
  }

  public compile(data: GenericObject = this._data) {
    if (!this._template) {
      throw new Error('Template is empty');
    }

    if (this._isCompiled) {
      return this;
    }

    // this._parseInterpretation(data);
    // this._parseControlFlow(data);
    this._parse();
    this._isCompiled = true;

    return this;
  }

  private _parse() {
    const templateLines = this._template?.split(`\n`);
    const startKeywords = START_KEYWORDS.join('|');
    const endKeywords = END_KEYWORDS.join('|');

    if (!templateLines) {
      throw new Error('Template is empty');
    }

    const { START_INTERPRETATION, END_INTERPRETATION } = this._delimiters;
    const { START_CONTROL, END_CONTROL } = this._delimiters;

    const interpretationRegex = new RegExp(
      `${START_INTERPRETATION}(.*?)${END_INTERPRETATION}`,
      'gims',
    );

    const startControlRegex = new RegExp(
      `${START_CONTROL}\\s?(${startKeywords})\\s?(.*?)\\s?:?\\s?${END_CONTROL}`,
      'gims',
    );

    const endControlRegex = new RegExp(
      `${START_CONTROL}\\s?(${endKeywords})\\s?${END_CONTROL}`,
      'gims',
    );

    let addContentType: AddContentType = AddContentType.ADD as AddContentType;

    for (const line of templateLines) {
      console.log({ addContentType });

      const interpretationMatch = interpretationRegex.exec(line);
      const startControlMatch = startControlRegex.exec(line);
      const endControlMatch = endControlRegex.exec(line);

      if (startControlMatch) {
        const [, startControlKeyword, controlCondition] = startControlMatch;

        if (startControlKeyword === 'if') {
          const result = this._parseControlFlow(startControlKeyword, controlCondition);
          addContentType = result
            ? AddContentType.ADD_UNTIL_NEXT_BLOCK
            : AddContentType.SKIP_UNTIL_NEXT_BLOCK;

          continue;
        } else if (['elif', 'else if', 'else', 'elseif'].includes(startControlKeyword)) {
          if (addContentType === AddContentType.ADD_UNTIL_NEXT_BLOCK) {
            addContentType = AddContentType.SKIP_UNTIL_ENDIF;
          } else if (addContentType === AddContentType.SKIP_UNTIL_NEXT_BLOCK) {
            const result = this._parseControlFlow(startControlKeyword, controlCondition);
            addContentType = result
              ? AddContentType.ADD_UNTIL_NEXT_BLOCK
              : AddContentType.SKIP_UNTIL_NEXT_BLOCK;
          }

          continue;
        }
      } else if (endControlMatch) {
        const [, endControlKeyword] = endControlMatch;

        if (endControlKeyword === 'endif') {
          addContentType = AddContentType.ADD;

          continue;
        }
      } else if (interpretationMatch) {
        if (
          addContentType !== AddContentType.ADD &&
          addContentType !== AddContentType.ADD_UNTIL_NEXT_BLOCK
        )
          continue;

        const parsedLine = line.replace(interpretationRegex, (_: string, group1: string) => {
          let key = group1.trim();

          const usesShortTernary = !!key.match(/\?\:/g);

          if (usesShortTernary) {
            key = key.replace(/(.*?)\?\:.*?/g, (match: string, group1: string) => {
              // take interpolation into account
              const splittedGroup = group1.split('${');

              return splittedGroup.length > 1
                ? `${splittedGroup[0]}\$\{${splittedGroup[1]} ? ${splittedGroup[1]} :`
                : `${group1} ? ${group1} :`;
            });
          }

          // creates a new function with params coming from the keys of the data object
          // and returns the value of the evaluated expression
          const fn = Function(...Object.keys(this._data), `return ${key}`);
          // executes the function with the values of the data object so the expression can use the data object

          return fn(...Object.values(this._data));
        });

        this._parsedTemplate.push(parsedLine);
        continue;
      }

      if (
        addContentType !== AddContentType.ADD &&
        addContentType !== AddContentType.ADD_UNTIL_NEXT_BLOCK
      )
        continue;

      this._parsedTemplate.push(line);
    }

    return this._parsedTemplate;
  }

  private _parseInterpretation(data: GenericObject = this._data) {
    const { START_INTERPRETATION, END_INTERPRETATION } = this._delimiters;

    this._template = this._template!.replace(
      new RegExp(`${START_INTERPRETATION}(.*?)${END_INTERPRETATION}`, 'g'),
      (_: string, group1: string) => {
        let key = group1.trim();

        const usesShortTernary = !!key.match(/\?\:/g);

        if (usesShortTernary) {
          key = key.replace(/(.*?)\?\:.*?/g, (match: string, group1: string) => {
            // take interpolation into account
            const splittedGroup = group1.split('${');

            return splittedGroup.length > 1
              ? `${splittedGroup[0]}\$\{${splittedGroup[1]} ? ${splittedGroup[1]} :`
              : `${group1} ? ${group1} :`;
          });
        }

        // creates a new function with params coming from the keys of the data object
        // and returns the value of the evaluated expression
        const fn = Function(...Object.keys(data), `return ${key}`);
        // executes the function with the values of the data object so the expression can use the data object
        return fn(...Object.values(data));
      },
    );
  }

  private _parseControlFlow(keyword: string, condition: string) {
    switch (keyword) {
      case 'if':
      case 'elseif':
      case 'else if':
      case 'elif':
        const fn = Function(...Object.keys(this._data), `return ${condition}`);
        return fn(...Object.values(this._data));
      case 'else':
        return true;
    }
  }
}
