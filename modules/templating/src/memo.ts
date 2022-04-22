class SonataError extends Error {
  private _path?: string;

  constructor(message: string) {
    super(message);
    this.name = 'SonataError';
  }

  public set path(path: string | undefined) {
    this._path = path;
  }
}

function rethrow(err: Error, str: string, lineno: number, filename?: string) {
  const lines = str.split('\n');
  const start = Math.max(lineno - 3, 0);
  const end = Math.min(lines.length, lineno + 3);

  // Error context
  // TODO: add line horizontal position
  let context = lines.slice(start, end).map((line, i) => {
    const curr = i + start + 1;
    return (curr === lineno ? ' \x1b[1;6;31m>>\x1b[0m ' : '    ') + curr + '| ' + line;
  });
  // TODO: add correct position based on error
  context.splice(lineno - 1, 0, '                      \x1b[1;6;31m^\x1b[0m');
  console.log(context);

  const finalContext = context.join('\n');

  // Alter exception message
  const error = new SonataError(
    `${filename || 'sonata'}:${lineno}\n${finalContext}\n\n${err.message}`,
  );

  error.path = filename;

  throw error;
}
