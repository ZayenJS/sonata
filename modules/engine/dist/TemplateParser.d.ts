import { Delimiter } from './TemplateEngine';
export declare class TemplateParser {
    private readonly delimiters;
    private readonly data;
    private _template;
    private _buffer;
    constructor(delimiters: Delimiter, data: any);
    /**
     * Replaces the current template with the one passed as a parameter
     *
     * @param {string} template the string representing the template
     * @returns {this} the current instance of the template parser to allow chaining
     */
    setTemplate(template: string): this;
    /**
     * Parses the template and returns the parsed template
     *
     * @param {string} template the string representing the template
     * @param {boolean} full whether it's a full template or a partial one
     *
     * @returns {string} the parsed template
     */
    parse(template?: string, full?: boolean): string;
    count: number;
    private _recursiveParse;
    private _cleanUpBlockTags;
    private _injectBlocks;
    /**
     * Searches for an include block with the "extends" keyword
     * ```html
     * {% extends "layouts/main" %}
     * ```
     *
     * @param {string} template the string representing the template
     * @returns {string|null} the loaded template or null if the current template is not extending another template
     */
    private _findParentTemplate;
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
    private _findBlocks;
    /**
     * Parses the template to get an executable JavaScript function
     * that will render the template with the data passed as a parameter
     * and returns it as a string
     *
     * @param {string} template the string representing the template
     * @param {boolean} full whether it's a full template or a partial one
     * @returns {string} the parsed template
     */
    private _parseTemplate;
    private _parseChar;
    private _parseOtherChars;
    private _parseInterpretationTag;
    private _parseCommentTag;
    private _parseControlFlow;
    private _parseControlFlowTag;
    private _getConditionalMap;
    private _getLoopMap;
    private _parseVarDeclaration;
    private _parseIncludeTag;
    private _parseBlockTag;
    private _loadIncludeTemplate;
}
