import { Delimiter } from './TemplateEngine';
export interface GenericObject {
    [key: string]: any;
}
export declare type TemplateMode = 'interpretation' | 'comment' | 'control' | 'include';
export interface TemplateOptions {
    delimiters: Partial<Delimiter>;
    cache?: string | null;
    data?: GenericObject;
}
export declare class Template {
    private _isCompiled;
    private _template?;
    private _parsedTemplate;
    private _compiledTemplate?;
    private _delimiters;
    private _data;
    private _templateParser;
    constructor(template: string, delimiters: Delimiter, options: TemplateOptions);
    addData(data: GenericObject): this;
    get data(): Readonly<GenericObject>;
    modifyData(key: string, value: string): this;
    deleteData(): this;
    render(data?: GenericObject): any;
    compile(data?: GenericObject): this;
    private _parse;
}
