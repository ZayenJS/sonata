import { Delimiter } from './TemplateEngine';
import { escape } from './utils';

export class TemplateParser {
  private _template: string = '';
  private _buffer: string = '';

  public constructor(private readonly delimiters: Delimiter, private readonly data: any) {}

  public setTemplate(template: string) {
    this._template = template;

    return this;
  }

  public parse(): string;
  public parse(template?: string): string {
    if (template) this.setTemplate(template);

    this._parseTemplate();

    return this._buffer;
  }

  private _parseTemplate(tmpl: string = this._template) {
    const {
      OPEN,
      CLOSE,
      START_INTERPRETATION,
      END_INTERPRETATION,
      COMMENT,
      CONTROL,
      INCLUDE,
    } = this.delimiters;

    this._buffer += "const buffer = [];\nbuffer.push('";

    let linenb = 0;

    for (let i = 0; i < tmpl.length; i++) {
      const char = tmpl[i];
      const nextChar = tmpl[i + 1];

      const line = `stack.linenb=${linenb}`;
      let prefix;
      let suffix;

      const isOpenTag = char === OPEN;
      const nextCharIsInterpretationStart = nextChar === START_INTERPRETATION;
      const nextCharIsComment = nextChar === COMMENT;
      const nextCharIsControl = nextChar === CONTROL;
      const nextCharIsInclude = nextChar === INCLUDE;

      const isStartInterpretationTag = isOpenTag && nextCharIsInterpretationStart;
      const isStartCommentTag = isOpenTag && nextCharIsComment;
      const isStartControlTag = isOpenTag && nextCharIsControl;
      const isStartIncludeTag = isOpenTag && nextCharIsInclude;

      if (isStartInterpretationTag) {
        const start = i + OPEN.length + START_INTERPRETATION.length;
        const end = tmpl.indexOf(END_INTERPRETATION + CLOSE, i);

        if (end < 0) {
          throw new Error(`Unclosed tag "${OPEN + START_INTERPRETATION}" at line ${linenb}`);
        }

        let tag = tmpl.slice(start, end).replace(/([^\W]*?)\s?\?\:/gims, (_, p1) => {
          // will replace the short ternary expression
          return `${p1} ? ${p1} :`;
        });

        i = end + END_INTERPRETATION.length;
        prefix = `', escape((${line}, `;
        suffix = `)))`;
        this._buffer += `${prefix}${tag}${suffix}; buffer.push('`;
        continue;
      } else if (isStartCommentTag) {
        const end = tmpl.indexOf(COMMENT + CLOSE, i);

        if (end < 0) {
          throw new Error(`Unclosed tag "${OPEN + COMMENT}" at line ${linenb}`);
        }

        i = end + 1;
        continue;
      } else if (isStartControlTag) {
        const start = i;
        const end = tmpl.indexOf(CONTROL + CLOSE, i);

        if (end < 0) {
          throw new Error(`Unclosed tag "${OPEN + CONTROL}" at line ${linenb}`);
        }

        const tagContent = tmpl.slice(start + 2, end);

        const varDeclarationMatch = /(.*?)=(.*)/i.exec(tagContent);

        const startMatch = /(if|elseif|else if|else|elif|while|foreach|for)(.*?):/i.exec(
          tagContent,
        );

        const endMatch = /(endif|endwhile|endforeach|endfor)/i.exec(tagContent);

        if (startMatch) {
          this._buffer += "');";
          const [, keyword, condition] = startMatch;
          // console.log({ start, end, keyword, condition });

          if (['elseif', 'else if', 'elif'].includes(keyword)) {
            this._buffer += `} else if (${condition}) {`;
          } else if (keyword === 'else') {
            this._buffer += `} else {`;
          } else if (keyword === 'if') {
            this._buffer += `if (${condition}) {`;
          } else if (keyword === 'while') {
            this._buffer += `while (${condition}) {`;
          } else if (keyword === 'foreach') {
            let [collection, variable] = condition.split(/as/gi).map(s => s.trim()) as any;

            this._buffer += `for (const ${variable} of ${collection}) {`;
          } else if (keyword === 'for') {
            const [variable, collection] = condition.split(/in/gi).map(s => s.trim());

            this._buffer += `for (const ${variable} in ${collection}) {`;
          } else {
            throw new Error(`Unknown control keyword "${keyword}" at line ${linenb}`);
          }

          this._buffer += `buffer.push('`;
        } else if (endMatch) {
          this._buffer += `')} buffer.push('`;
        } else if (varDeclarationMatch) {
          const [, declaration, value] = varDeclarationMatch;

          const [keyword, varName] = declaration
            .split(/\s/)
            .map(d => d.trim())
            .filter(d => d);

          const varAssignment =
            keyword === 'set'
              ? `let ${varName} = null; ${varName} = ${value};`
              : `${keyword} = ${value};`;
          console.log({ varAssignment });

          this._buffer += `');${varAssignment} buffer.push('`;
        }

        i = end + 1;
        continue;
      }

      switch (char) {
        case '\\':
          this._buffer += '\\\\';
          break;
        case "'":
          this._buffer += "\\'";
          break;
        case '\n':
          linenb++;
          this._buffer += `\\n`;
          break;

        default:
          this._buffer += char;
      }
    }

    this._buffer += "');return buffer.join('');";
    console.log(this._buffer);

    return this._buffer;
  }
}
