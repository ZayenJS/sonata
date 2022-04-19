"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Template = void 0;
class Template {
    static OPEN_TAG = '{';
    static CLOSE_TAG = '}';
    static START_INTERPRETATION = '{';
    static END_INTERPRETATION = '}';
    static START_COMMENT = `${Template.OPEN_TAG}#`;
    static END_COMMENT = `#${Template.CLOSE_TAG}`;
    static START_CONTROL = `${Template.OPEN_TAG}%`;
    static END_CONTROL = `%${Template.CLOSE_TAG}`;
    static START_INCLUDE = `${Template.OPEN_TAG}@`;
    static END_INCLUDE = `@${Template.CLOSE_TAG}`;
    _template;
    _data = {};
    constructor(template, data) {
        this._template = template;
        this._data = data ?? {};
    }
    render(data = this._data) {
        if (this._template) {
            this.compile(data);
        }
        return this._template;
    }
    compile(data = this._data) {
        if (!this._template) {
            throw new Error('Template is empty');
        }
        this._parseInterpretation(data);
        this._parseControlFlow(data);
    }
    _parseInterpretation(data = this._data) {
        this._template = this._template.replace(new RegExp(`${Template.OPEN_TAG}${Template.START_INTERPRETATION}(.*?)${Template.END_INTERPRETATION}${Template.CLOSE_TAG}`, 'g'), (_, group1) => {
            let key = group1.trim();
            const usesShortTernary = !!key.match(/\?\:/g);
            if (usesShortTernary) {
                key = key.replace(/(.*?)\?\:.*?/g, (match, group1) => {
                    // take interpolation into account
                    const splittedGroup = group1.split('${');
                    return splittedGroup.length > 1
                        ? `${splittedGroup[0]}\$\{${splittedGroup[1]} ? ${splittedGroup[1]} :`
                        : `${group1} ? ${group1} :`;
                });
            }
            const usesInterpolation = !!key.match(/\`.*?\$\{.*?\}.*?\`/g);
            const usesTernary = !!key.match(/\?.*?\:.*?/g);
            const usesNullCoalescing = !!key.match(/\?\?.*?/g);
            // if the key is a ternary operator or nullish coalescing, we need to parse it
            if (usesTernary || usesNullCoalescing || usesInterpolation) {
                // creates a new function with params coming from the keys of the data object
                // and returns the value of the evaluated expression
                const fn = Function(...Object.keys(data), `return ${key}`);
                // executes the function with the values of the data object so the expression can use the data object
                return fn(...Object.values(data));
            }
            return data[key] ?? '';
        });
    }
    _parseControlFlow(data = this._data) {
        const controlFlowRegex = new RegExp(`${Template.START_CONTROL}\\s?(if|for)\\s?(.*?)\\s?:\\s?${Template.END_CONTROL}(.*?)${Template.START_CONTROL}\\s?(?:endif)\\s?${Template.END_CONTROL}`, 'gims');
        this._template = this._template.replace(controlFlowRegex, (_, group1, group2, group3, group4) => {
            const control = group1.trim();
            const condition = group2.trim();
            const content = group3.trim();
            const endControl = group4.trim();
            switch (control) {
                case 'if':
                    // if condition working
                    console.log('IF');
                    return this._parseIf(condition, content, data);
                // TODO: else if and else
                // case 'elif':
                // case 'elseif':
                // case 'else if':
                //   console.log('ELSE IF');
                //   return this._parseIf(condition, content, data);
                // case 'else':
                //   return this._parseElse(data);
                case 'endif':
                    console.log('END IF');
                    return this._parseEndIf(data);
                // case 'for':
                //   return this._parseFor(args.join(' '), data);
                // case 'endfor':
                //   return this._parseEndFor(data);
                default:
                    return '';
            }
        });
    }
    _parseIf(condition, content, data = this._data) {
        const fn = Function(...Object.keys(data), `return ${condition}`);
        const result = fn(...Object.values(data));
        console.log({ result });
        if (result) {
            return content;
        }
        return '';
    }
    _parseEndIf(data = this._data) {
        return '';
    }
}
exports.Template = Template;
