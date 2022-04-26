import { GenericObject, Template } from './Template';
export declare type DelimiterName = 'OPEN' | 'CLOSE' | 'START_INTERPRETATION' | 'END_INTERPRETATION' | 'COMMENT' | 'CONTROL' | 'INCLUDE';
export declare type Delimiter = {
    [key in DelimiterName]: string;
};
interface TemplateEngineOptions {
    delimiters?: Partial<Delimiter>;
    cache?: string | null;
    data?: GenericObject;
}
export declare class TemplateEngine {
    private readonly templatesPath;
    private _possibleExtensions;
    private _delimiters;
    private _cache;
    constructor(templatesPath: string, options?: TemplateEngineOptions);
    createTemplate(templateName: string, data?: GenericObject): Template;
    addNewExtension(extension: string): void;
}
export {};
