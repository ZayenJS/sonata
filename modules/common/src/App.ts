import fs from 'fs';
import http, { Server } from 'http';
import path from 'path';
import {
  BODY_PARAM_METADATA,
  DEPT_INJECTION_METADATA,
  QUERY_PARAM_METADATA,
} from './constants';
import { RequestParser } from './Helpers/RequestParser';
import { Request } from './http/Request';
import { Response } from './http/Response';

import { Router } from './http/routing/Router';

// TODO: expose a wrapper of the App class to the outside world

export class App {
  private _router: Router;
  private _nodeServer: http.Server = new Server();
  private _controllersDirectory: string = '';
  private _controllers = new Set<Function>();

  constructor() {
    this._router = new Router();
  }

  public get router() {
    return this._router;
  }

  public registerControllers() {
    fs.readdir(this._controllersDirectory, (err, files) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      for (const file of files) {
        require(path.join(this._controllersDirectory, file));
      }
    });
  }

  public setControllersDirectory(directory: string) {
    this._controllersDirectory = directory;

    return this;
  }

  public registerMiddlewares() {}

  public listen(): this;
  public listen(port: number): this;
  public listen(port: number, callback: () => void): this;
  public listen(port?: number, callback?: () => void) {
    this._nodeServer.listen(port ?? 5000, () => {
      // TODO: logging stuff...
      console.info('Server is listening on port 3000');

      callback?.();
    });

    return this;
  }

  public create() {
    this._nodeServer = http.createServer(async (req, res) => {
      const url = req.url;
      const method = req.method;

      const request = new Request(req);
      const response = new Response(res);

      const parsedUrl = url?.split('?');
      request.query = RequestParser.parseQuery(parsedUrl?.[1]);
      request.body = await RequestParser.parseBody(req);

      const registeredRoutes = this.router.getRoutes();

      const routes = [...registeredRoutes];

      const matchingRoute = routes.find(
        route => url?.includes(route.getPath()) && route.getMethod() === method,
      );

      if (registeredRoutes.size === 0 || !matchingRoute) {
        res.writeHead(404);
        return res.end('404');
      }

      this.registerMiddlewares();

      const routeHandler = matchingRoute.getHandler();
      const controller = matchingRoute.getController();

      const args: unknown[] = [];

      // QUERY PARAM DECORATOR
      const queryMetadata =
        Reflect.getMetadata(QUERY_PARAM_METADATA, controller, matchingRoute.getName()) ??
        [];

      for (const queryData of queryMetadata) {
        let queryParam: any = request.query.get(queryData.name);
        if (!queryData.name) {
          queryParam = {};

          request.query.forEach((value, key) => {
            queryParam[key] = value;
          });
        }

        args[queryData.parameterIndex] = queryParam;
      }

      // BODY PARAM DECORATOR
      const bodyMetadata =
        Reflect.getMetadata(BODY_PARAM_METADATA, controller, matchingRoute.getName()) ??
        [];

      for (const bodyData of bodyMetadata) {
        let bodyParam: any = request.body.get(bodyData.name);

        if (!bodyData.name) {
          bodyParam = {};

          request.body.forEach((value, key) => {
            bodyParam[key] = value;
          });
        }

        args[bodyData.parameterIndex] = bodyParam;
      }

      // DEPENDANCY INJECTION
      const deptInjectionMetadata =
        Reflect.getMetadata(
          DEPT_INJECTION_METADATA,
          controller,
          matchingRoute.getName(),
        ) ?? [];

      for (const deptInjectionData of deptInjectionMetadata) {
        const instance = new deptInjectionData.class();
        args[deptInjectionData.parameterIndex] = instance;
      }

      const endResponse = routeHandler(...args);

      if (endResponse instanceof Promise) {
        return endResponse.then(responseData => {
          const data =
            responseData instanceof Object ? { ...responseData } : { body: responseData };

          response
            .status(data.status)
            .setHeader('Content-Type', data.headers?.['Content-Type'] as string)
            .send(data.body);
        });
      }
      const data =
        endResponse instanceof Object ? { ...endResponse } : { body: endResponse };

      return response
        .status(data.status)
        .setHeader('Content-Type', data.headers?.['Content-Type'])
        .send(data.body);
    });
  }

  public get nodeServer() {
    return this._nodeServer;
  }

  public addInjectable(type: string, element: object) {
    // add to the dependency injection container

    return this;
  }

  public addController(controller: Function) {
    this._controllers.add(controller);

    return this;
  }

  public get controllers() {
    return this._controllers;
  }
}

export default new App();
