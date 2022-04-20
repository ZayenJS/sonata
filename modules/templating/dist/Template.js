"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Template = void 0;
var AddContentType;
(function (AddContentType) {
    AddContentType[AddContentType["ADD"] = 1] = "ADD";
    AddContentType[AddContentType["SKIP_UNTIL_NEXT_BLOCK"] = 2] = "SKIP_UNTIL_NEXT_BLOCK";
    AddContentType[AddContentType["ADD_UNTIL_NEXT_BLOCK"] = 3] = "ADD_UNTIL_NEXT_BLOCK";
    AddContentType[AddContentType["SKIP_UNTIL_ENDIF"] = 4] = "SKIP_UNTIL_ENDIF";
})(AddContentType || (AddContentType = {}));
const START_KEYWORDS = ['if', 'elseif', 'else if', 'elif', 'else', 'for', 'while'];
const END_KEYWORDS = ['endif', 'endfor', 'endwhile'];
class Template {
    _isCompiled = false;
    _template;
    _parsedTemplate = [];
    _delimiters;
    _data = {};
    constructor(template, delimiters, options) {
        this._template = template;
        this._delimiters = delimiters;
        this._data = options.data || {};
    }
    addData(data) {
        this._data = { ...this._data, ...data };
        return this;
    }
    get data() {
        return Object.freeze(this._data);
    }
    modifyData(key, value) {
        this._data[key] = value;
        return this;
    }
    deleteData(key) {
        if (!key) {
            this._data = {};
            return this;
        }
        delete this._data[key];
        return this;
    }
    render(data = this._data) {
        console.time('render');
        if (this._template && !this._isCompiled) {
            this.compile(data);
        }
        console.timeEnd('render');
        return this._parsedTemplate.join('\n');
    }
    compile(data = this._data) {
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
    _parse() {
        const templateLines = this._template?.split(`\n`);
        const startKeywords = START_KEYWORDS.join('|');
        const endKeywords = END_KEYWORDS.join('|');
        if (!templateLines) {
            throw new Error('Template is empty');
        }
        const { START_INTERPRETATION, END_INTERPRETATION } = this._delimiters;
        const { START_CONTROL, END_CONTROL } = this._delimiters;
        const interpretationRegex = new RegExp(`${START_INTERPRETATION}(.*?)${END_INTERPRETATION}`, 'gims');
        const startControlRegex = new RegExp(`${START_CONTROL}\\s?(${startKeywords})\\s?(.*?)\\s?:?\\s?${END_CONTROL}`, 'gims');
        const endControlRegex = new RegExp(`${START_CONTROL}\\s?(${endKeywords})\\s?${END_CONTROL}`, 'gims');
        let addContentType = AddContentType.ADD;
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
                }
                else if (['elif', 'else if', 'else', 'elseif'].includes(startControlKeyword)) {
                    if (addContentType === AddContentType.ADD_UNTIL_NEXT_BLOCK) {
                        addContentType = AddContentType.SKIP_UNTIL_ENDIF;
                    }
                    else if (addContentType === AddContentType.SKIP_UNTIL_NEXT_BLOCK) {
                        const result = this._parseControlFlow(startControlKeyword, controlCondition);
                        addContentType = result
                            ? AddContentType.ADD_UNTIL_NEXT_BLOCK
                            : AddContentType.SKIP_UNTIL_NEXT_BLOCK;
                    }
                    continue;
                }
            }
            else if (endControlMatch) {
                const [, endControlKeyword] = endControlMatch;
                if (endControlKeyword === 'endif') {
                    addContentType = AddContentType.ADD;
                    continue;
                }
            }
            else if (interpretationMatch) {
                if (addContentType !== AddContentType.ADD &&
                    addContentType !== AddContentType.ADD_UNTIL_NEXT_BLOCK)
                    continue;
                const parsedLine = line.replace(interpretationRegex, (_, group1) => {
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
                    // creates a new function with params coming from the keys of the data object
                    // and returns the value of the evaluated expression
                    const fn = Function(...Object.keys(this._data), `return ${key}`);
                    // executes the function with the values of the data object so the expression can use the data object
                    return fn(...Object.values(this._data));
                });
                this._parsedTemplate.push(parsedLine);
                continue;
            }
            if (addContentType !== AddContentType.ADD &&
                addContentType !== AddContentType.ADD_UNTIL_NEXT_BLOCK)
                continue;
            this._parsedTemplate.push(line);
        }
        return this._parsedTemplate;
    }
    _parseInterpretation(data = this._data) {
        const { START_INTERPRETATION, END_INTERPRETATION } = this._delimiters;
        this._template = this._template.replace(new RegExp(`${START_INTERPRETATION}(.*?)${END_INTERPRETATION}`, 'g'), (_, group1) => {
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
            // creates a new function with params coming from the keys of the data object
            // and returns the value of the evaluated expression
            const fn = Function(...Object.keys(data), `return ${key}`);
            // executes the function with the values of the data object so the expression can use the data object
            return fn(...Object.values(data));
        });
    }
    _parseControlFlow(keyword, condition) {
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
exports.Template = Template;
