declare class TemplateLoader {
    private static _instance;
    private _templatesPath;
    private constructor();
    static getInstance(): TemplateLoader;
    get templatesPath(): string;
    setTemplatesPath(templatesPath: string): this;
    load(templateName: string, extensions?: string[]): string;
}
declare const _default: TemplateLoader;
export default _default;
