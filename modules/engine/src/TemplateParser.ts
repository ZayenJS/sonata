import TemplateLoader from './TemplateLoader';
import { Delimiter } from './TemplateEngine';
import { escapeRegexChars, regexIndexOf } from './utils';
import { GenericObject } from './Template';
import { Filter, FilterName } from './Filter';

type ControlFlowKeyword =
  | 'if'
  | 'elif'
  | 'else if'
  | 'elseif'
  | 'else'
  | 'for'
  | 'foreach'
  | 'while';

interface ParseTagParams {
  template: string;
  index: number;
  linenb: number;
}

interface ParseControlFlowParams {
  template: string;
  index: number;
  linenb: number;
}

interface ParseInterpretationTagParams extends ParseTagParams {
  line: string;
}

interface ParseCommentTagParams extends ParseTagParams {}

interface ParseIncludeTag extends ParseCommentTagParams {}
interface ParseBlockTagParams {
  template: string;
  start: number;
}

interface LoadIncludeTemplateParams {
  template: string;
  start: number;
  end: number;
}

// TODO: Add documentation
export class TemplateParser {
  private _template: string = '';
  private _buffer: string = '';

  public constructor(private readonly delimiters: Delimiter, private readonly data: any) {}

  /**
   * Replaces the current template with the one passed as a parameter
   *
   * @param {string} template the string representing the template
   * @returns {this} the current instance of the template parser to allow chaining
   */
  public setTemplate(template: string): this {
    this._template = template;

    return this;
  }

  /**
   * Parses the template and returns the parsed template
   *
   * @param {string} template the string representing the template
   * @param {boolean} full whether it's a full template or a partial one
   *
   * @returns {string} the parsed template
   */

  public parse(template: string = this._template, full: boolean = true): string {
    let finalTemplate = template;

    if (full) {
      finalTemplate = this._recursiveParse(template);
      finalTemplate = this._cleanUpBlockTags();
    }

    this._parseTemplate(finalTemplate, full);

    return this._buffer;
  }

  count = 0;

  private _recursiveParse(template: string = this._template): string {
    const parentTemplate = this._findParentTemplate(template);

    if (parentTemplate) {
      const parentBlocks = this._findBlocks(parentTemplate);

      const currentTemplateBlocks = this._findBlocks(this._template);

      const parentTemplateWithInjectedBlocks = this._injectBlocks(
        parentTemplate,
        parentBlocks,
        currentTemplateBlocks,
      );

      this._template = parentTemplateWithInjectedBlocks;

      this.count++;
      this._recursiveParse();
    }

    return this._template;
  }

  private _cleanUpBlockTags() {
    const { OPEN, CLOSE, INCLUDE } = this.delimiters;

    const includeBlockRegex = new RegExp(
      `${OPEN}${INCLUDE}.*?block.*?${INCLUDE}${CLOSE}\\n?`,
      'gim',
    );

    let match;

    while ((match = includeBlockRegex.exec(this._template)) !== null) {
      this._template = this._template.replace(match[0], '');
    }

    return this._template;
  }

  private _injectBlocks(
    parentTemplate: string,
    parentBlocks: GenericObject,
    currentBlocks: GenericObject,
  ) {
    const { OPEN, CLOSE, INCLUDE } = this.delimiters;
    const alreadyInjectedBlocks: string[] = [];

    for (const [name, content] of Object.entries(currentBlocks)) {
      if (!parentBlocks[name]) {
        throw new Error(`${name} block is not defined in the parent template`);
      }
      const blockRegex = new RegExp(
        `(${OPEN}${INCLUDE}\\s?block\\s?${name}\\s?${INCLUDE}${CLOSE})\\n?(${escapeRegexChars(
          parentBlocks[name],
        )})\\n?(${OPEN}${INCLUDE}\\s?endblock\\s?${INCLUDE}${CLOSE}\\n?)`,
        'sgi',
      );

      if (!blockRegex.test(parentTemplate)) {
        console.log({
          blockRegex,
          name,
          content,
          parentTemplate,
          search: escapeRegexChars(parentBlocks[name]),
        });
      }

      parentTemplate = parentTemplate.replace(blockRegex, (_, g1, g2, g3) => {
        return g1 + content + g3;
      });

      alreadyInjectedBlocks.push(name);
    }

    return parentTemplate;
  }

  /**
   * Searches for an include block with the "extends" keyword
   * ```html
   * {% extends "layouts/main" %}
   * ```
   *
   * @param {string} template the string representing the template
   * @returns {string|null} the loaded template or null if the current template is not extending another template
   */
  private _findParentTemplate(template: string): string | null {
    const { OPEN, CLOSE, INCLUDE } = this.delimiters;

    // will match {% extends layouts/main %} with or without leading/trailing whitespaces
    // please note: no need to use quotes around the template name
    const extendsTemplateRegex = new RegExp(
      `${OPEN}${INCLUDE}\\s?extends\\s?(.*?)\\s?${INCLUDE}${CLOSE}\\n?`,
      'gi',
    );

    const extendsTemplate = extendsTemplateRegex.exec(template);

    // template does not extend another template
    if (!extendsTemplate) return null;

    // remove the extends block from the template
    this._template = this._template.replace(extendsTemplate[0], '');

    // loads and returns the content of the parent template
    return TemplateLoader.load(extendsTemplate[1]);
  }

  /**
   * Parses the template to find the blocks and their content and
   * returns an object containing the blocks and their content
   *
   * @param {string} template the string representing the template
   * @returns {GenericObject} an object containing the block name as a key
   * and the block content as a value for each block found in the input template
   *
   * ```ts
   * {
   *  main: '<p>Hello World</p>',
   *  aside: '<div>lorem ipsum</div>',
   * }
   * ```
   */
  private _findBlocks(template: string): GenericObject {
    const blocks: GenericObject = {};

    const { OPEN, CLOSE, INCLUDE } = this.delimiters;

    while (true) {
      // will match {% block main %}content...{% endblock %} with or without leading/trailing whitespaces
      const blockRegex = new RegExp(
        `${OPEN}${INCLUDE}\\s?block\\s?(.*?)\\s?${INCLUDE}${CLOSE}\\n?(.*?)${OPEN}${INCLUDE}\\s?endblock\\s?${INCLUDE}${CLOSE}`,
        'gims',
      );
      const [match, name, content] = blockRegex.exec(template) ?? [];

      // no more blocks found
      if (!match) break;

      blocks[name] = content;

      // remove the block from the template to avoid infinite loop
      template = template.replace(match, '');
    }

    return blocks;
  }

  /**
   * Parses the template to get an executable JavaScript function
   * that will render the template with the data passed as a parameter
   * and returns it as a string
   *
   * @param {string} template the string representing the template
   * @param {boolean} full whether it's a full template or a partial one
   * @returns {string} the parsed template
   */
  private _parseTemplate(template: string = this._template, full: boolean = true) {
    if (full) this._buffer += 'const buffer = [];';

    this._buffer += `\nbuffer.push('`;

    let linenb = 0;

    for (let i = 0; i < template.length; i++) {
      const char = template[i];
      const nextChar = template[i + 1];

      const line = `stack.linenb=${linenb}`;

      const {
        isStartInterpretationTag,
        isStartCommentTag,
        isStartControlTag,
        isStartIncludeTag,
      } = this._parseChar(char, nextChar);

      if (isStartInterpretationTag) {
        const { index, toAddToBuffer } = this._parseInterpretationTag({
          index: i,
          line,
          linenb,
          template,
        });

        i = index;

        this._buffer += toAddToBuffer;
        continue;
      } else if (isStartCommentTag) {
        i = this._parseCommentTag({ template, index: i, linenb });

        continue;
      } else if (isStartControlTag) {
        const { end } = this._parseControlFlow({ template, index: i, linenb });

        i = end + 1;
        continue;
      } else if (isStartIncludeTag) {
        const { start, end, isBlockTemplate } = this._parseIncludeTag({
          template,
          index: i,
          linenb,
        });

        if (isBlockTemplate) {
          i = this._parseBlockTag({ template, start });
          continue;
        }

        const { toAddToBuffer } = this._loadIncludeTemplate({ template, start, end });
        this._buffer += toAddToBuffer;

        i = end + 1;
        continue;
      }

      // will add 1 to the line number if the current character is a new line
      linenb += this._parseOtherChars(char);
    }

    this._buffer += "');";

    if (full) this._buffer += "return buffer.join('');";

    return this._buffer;
  }

  private _parseChar(char: string, nextChar: string) {
    const { OPEN, START_INTERPRETATION, COMMENT, CONTROL, INCLUDE } = this.delimiters;

    const isOpenTag = char === OPEN;
    const nextCharIsInterpretationStart = nextChar === START_INTERPRETATION;
    const nextCharIsComment = nextChar === COMMENT;
    const nextCharIsControl = nextChar === CONTROL;
    const nextCharIsInclude = nextChar === INCLUDE;

    const isStartInterpretationTag = isOpenTag && nextCharIsInterpretationStart;
    const isStartCommentTag = isOpenTag && nextCharIsComment;
    const isStartControlTag = isOpenTag && nextCharIsControl;
    const isStartIncludeTag = isOpenTag && nextCharIsInclude;

    return {
      isStartInterpretationTag,
      isStartCommentTag,
      isStartControlTag,
      isStartIncludeTag,
    };
  }

  private _parseOtherChars(char: string) {
    let lineNbIncrease = 0;

    switch (char) {
      case '\\':
        this._buffer += '\\\\';
        break;
      case "'":
        this._buffer += "\\'";
        break;
      case '\n':
        lineNbIncrease = 1;
        this._buffer += `\\n`;
        break;

      default:
        this._buffer += char;
    }

    return lineNbIncrease;
  }

  private _parseInterpretationTag({
    template,
    index,
    linenb,
    line,
  }: ParseInterpretationTagParams) {
    const { OPEN, CLOSE, START_INTERPRETATION, END_INTERPRETATION } = this.delimiters;

    const start = index + OPEN.length + START_INTERPRETATION.length;
    const end = template.indexOf(END_INTERPRETATION + CLOSE, index);

    if (end < 0) {
      throw new Error(`Unclosed tag "${OPEN + START_INTERPRETATION}" at line ${linenb}`);
    }

    let tag = template.slice(start, end).replace(/([^\W]*?)\s?\?\:/gims, (_, p1) => {
      // will replace the short ternary expression
      return `${p1} ? ${p1} :`;
    });

    const prefix = `', escape((${line}, `;
    const suffix = `)))`;

    const tagWithFilter = tag.split('=>').map(el => el.trim());

    if (tagWithFilter.length > 1) {
      let variable = tagWithFilter.shift() as string;

      for (const filter of tagWithFilter) {
        const filterName = filter.split('(')[0];
        const parameters =
          /\((.*?)\)/
            .exec(filter)?.[1]
            .split(/{(.*?)}/gim)
            .filter(el => el)
            .map(el =>
              el
                .trim()
                .split(',')
                .filter(el => el),
            )
            .map(el => el.join(',')) ?? [];

        const filterInstance = new Filter(filterName as FilterName, parameters);

        variable = filterInstance.apply(variable);
      }

      tag = variable;
    }

    return {
      index: end + END_INTERPRETATION.length,
      toAddToBuffer: `${prefix}typeof ${tag} !== 'undefined' ? ${tag} : '' ${suffix}; buffer.push('`,
    };
  }

  private _parseCommentTag({ template, index, linenb }: ParseCommentTagParams) {
    const { OPEN, CLOSE, COMMENT } = this.delimiters;
    const end = template.indexOf(COMMENT + CLOSE, index);

    if (end < 0) {
      throw new Error(`Unclosed tag "${OPEN + COMMENT}" at line ${linenb}`);
    }

    return end + 1;
  }

  private _parseControlFlow({ template, index, linenb }: ParseControlFlowParams) {
    const { OPEN, CLOSE, CONTROL } = this.delimiters;

    const start = index;
    const end = template.indexOf(CONTROL + CLOSE, index);

    if (end < 0) {
      throw new Error(`Unclosed tag "${OPEN + CONTROL}" at line ${linenb}`);
    }

    const tagContent = template.slice(start + 2, end);

    const varDeclarationMatch = /(.*?)=(.*)/i.exec(tagContent);
    const incrDecrMatch = /[\w\d]+\s?\+\+|\+\+\s?[\w\d]+|[\w\d]+\s?--|--\s?[\w\d]+/i.exec(
      tagContent,
    );
    const startMatch = /(if|elseif|else if|else|elif|while|foreach|for)(.*?):/i.exec(
      tagContent,
    );
    const endMatch = /(endif|endwhile|endforeach|endfor)/i.exec(tagContent);

    if (startMatch) {
      this._parseControlFlowTag(startMatch, linenb);
    } else if (endMatch) {
      this._buffer += `')} buffer.push('`;
    } else if (varDeclarationMatch) {
      const { toAddToBuffer } = this._parseVarDeclaration(varDeclarationMatch, tagContent);

      this._buffer += toAddToBuffer;
    } else if (incrDecrMatch) {
      const [incrementationOrDecrementation] = incrDecrMatch;

      this._buffer += `');${incrementationOrDecrementation}; buffer.push('`;
    }

    return { end };
  }

  private _parseControlFlowTag(startMatch: RegExpExecArray, linenb: number) {
    this._buffer += "');";
    const [, keyword, condition] = startMatch;

    const jsValidCondition = condition
      .replace(/\band\b/g, '&&')
      .replace(/\bor\b/g, '||')
      .replace(/\bnot\b/g, '!');

    const controlMap = {
      ...this._getConditionalMap(jsValidCondition),
      ...this._getLoopMap(jsValidCondition),
    };

    if (!controlMap[keyword as ControlFlowKeyword]) {
      throw new Error(`Unrecognized control flow keyword "${keyword}" at line ${linenb}`);
    }

    this._buffer += controlMap[keyword as ControlFlowKeyword]();

    this._buffer += `buffer.push('`;
  }

  private _getConditionalMap(condition: string) {
    return {
      if: () => `if (${condition}) {`,
      elif: () => `} else if (${condition}) {`,
      elseif: () => `} else if (${condition}) {`,
      'else if': () => `} else if (${condition}) {`,
      else: () => `} else {`,
    };
  }

  private _getLoopMap(condition: string) {
    return {
      while: () => `while (${condition}) {`,
      foreach: () => {
        let [collection, variable] = condition.split(/as/gi).map(s => s.trim()) as any;

        return `for (const ${variable} of ${collection}) {`;
      },
      for: () => {
        let [variable, collection] = condition.split(/in/gi).map(s => s.trim());

        return `for (let ${variable} of ${collection}) {`;
      },
    };
  }

  private _parseVarDeclaration(varDeclarationMatch: RegExpExecArray, tagContent: string) {
    const [, declaration, value] = varDeclarationMatch;

    const [keyword, varName] = declaration
      .split(/\s/)
      .map(d => d.trim())
      .filter(d => d);

    let varAssignment = tagContent.endsWith(';') ? tagContent : `${tagContent};`;

    if (keyword === 'set') {
      varAssignment = `let ${varName} = null; ${varName} = ${value};`;
    }

    return {
      toAddToBuffer: `');${varAssignment.trim()} buffer.push('`,
    };
  }

  private _parseIncludeTag({ index, linenb, template }: ParseIncludeTag) {
    const { OPEN, CLOSE, INCLUDE } = this.delimiters;

    const start = index + OPEN.length + INCLUDE.length;
    const end = template.indexOf(INCLUDE + CLOSE, index);

    if (end < 0) {
      throw new Error(`Unclosed tag "${OPEN + INCLUDE}" at line ${linenb}`);
    }

    const isBlockTemplate = new RegExp(
      `block\\s?(.*?)\\s?${INCLUDE}${CLOSE}\\n?(.*?)\\n?${OPEN}${INCLUDE}\\s?endblock\\s${INCLUDE}${CLOSE}`,
      'gims',
    ).exec(template.slice(start));

    return { isBlockTemplate, start, end };
  }

  private _parseBlockTag({ start, template }: ParseBlockTagParams) {
    const { CLOSE, INCLUDE } = this.delimiters;

    const end = regexIndexOf(template, new RegExp(`endblock\\s?${INCLUDE}${CLOSE}`), start);

    return end + 'endblock'.length + INCLUDE.length + CLOSE.length;
  }

  private _loadIncludeTemplate({ template, start, end }: LoadIncludeTemplateParams) {
    const templatePath = template.slice(start, end).trim();
    const include = TemplateLoader.load(templatePath);
    const parsedInclude = new TemplateParser(this.delimiters, this.data).parse(include, false);

    return {
      toAddToBuffer: `');${parsedInclude}; buffer.push('`,
    };
  }
}
