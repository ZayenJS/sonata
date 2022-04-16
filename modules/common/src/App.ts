import { FS } from './Helpers/FS';
import { Request } from './http/Request';
import { Response } from './http/Response';
import { Router } from './http/routing/Router';

import { Server } from './Server';

export interface AppConfig {
  port?: number;
  views?: string;
  publicFolder?: string;
}

export class App {
  private static _instance: App;
  private _router: Router;
  private _server: Server;
  private _config = {
    views: `${FS.findRootDirectory()}/views`,
    publicFolder: `${FS.findRootDirectory()}/public`,
  };

  public get config() {
    return this._config;
  }

  public get router() {
    return this._router;
  }

  public set(key: keyof AppConfig, value: any) {
    //@ts-ignore
    this._config[key] = value;

    return this;
  }

  public static getInstance(): App {
    if (!this._instance) {
      this._instance = new App();
    }

    return this._instance;
  }

  private constructor() {
    this._router = new Router();
    this._server = new Server(this._router);
  }

  public registerMiddlewares() {}

  public create() {
    this._server.create();
    return this;
  }

  public listen(): this;
  public listen(port: number): this;
  public listen(port: number, callback: () => void): this;
  public listen(port: number = 5000, callback?: () => void) {
    this._server.nodeServer.listen(port, () => {
      // TODO: logging stuff...
      console.info(`Server is listening on port ${port}`);

      callback?.();
    });

    return this;
  }

  public catchAll(callback: (request: Request, response: Response, message?: string) => void) {
    this._server.catchAllCallback = callback;

    return this;
  }

  public notFound(callback: (request: Request, response: Response) => void) {
    this._server.notFoundCallback = callback;

    return this;
  }

  public serverError(callback: (request: Request, response: Response, error: string) => void) {
    this._server.serverErrorCallback = callback;

    return this;
  }

  public get nodeServer() {
    return this._server.nodeServer;
  }
}

export default App.getInstance();
