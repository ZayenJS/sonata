declare type TemplateFunctionName = 'range';
declare class TemplateFunctions {
    private static _instance?;
    private constructor();
    static getInstance(): TemplateFunctions;
    getAll(): {
        range: (start: number, end?: number | undefined, step?: number | undefined) => number[];
    };
    get(name: TemplateFunctionName): (start: number, end?: number | undefined, step?: number | undefined) => number[];
    private range;
}
declare const _default: TemplateFunctions;
export default _default;
