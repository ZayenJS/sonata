export class Logger {
  private static _instance: Logger;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger._instance) {
      Logger._instance = new Logger();
    }

    return Logger._instance;
  }

  public info(message: string, ...args: any[]) {
    console.info(`[INFO] ${message}`, ...args);
  }

  public error(message: string, ...args: any[]) {
    console.error(`[ERROR] ${message}`, ...args);
  }

  public warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${message}`, ...args);
  }

  public debug(message: string, ...args: any[]) {
    console.debug(`[DEBUG] ${message}`, ...args);
  }

  public trace(message: string, ...args: any[]) {
    console.trace(`[TRACE] ${message}`, ...args);
  }

  public log(message: string, ...args: any[]) {
    console.log(`[LOG] ${message}`, ...args);
  }

  public dir(message: string, ...args: any[]) {
    console.dir(`[DIR] ${message}`, ...args);
  }

  public custom(name: string, line: string | number, ...args: any[]) {
    console.log(`\x1b[33m[${name}]\x1b[0m \x1b[34;5mLINE ${line}\x1b[0m`, ...args);
  }
}
