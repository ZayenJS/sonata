declare class SonataError extends Error {
    private _path?;
    constructor(message: string);
    set path(path: string | undefined);
}
declare function rethrow(err: Error, str: string, lineno: number, filename?: string): void;
