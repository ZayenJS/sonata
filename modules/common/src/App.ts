import http, { Server } from 'http';
import {
  BODY_PARAM_METADATA,
  DEPT_INJECTION_METADATA,
  HEADERS_METADATA,
  HTTP_STATUS_CODE_METADATA,
  QUERY_PARAM_METADATA,
} from './constants';
import { RequestMethod } from './enums/request-methods.enum';
import { RequestParser } from './Helpers/RequestParser';
import { Request } from './http/Request';
import { Response } from './http/Response';

import { Router } from './http/routing/Router';
import { Constructor, InjectionContainer } from './Injection/InjectionContainer';

// TODO: expose a wrapper of the App class to the outside world

export class App {
  private _router: Router;
  private _nodeServer: http.Server = new Server();

  constructor() {
    this._router = new Router();
  }

  public get router() {
    return this._router;
  }

  public registerMiddlewares() {}

  public listen(): this;
  public listen(port: number): this;
  public listen(port: number, callback: () => void): this;
  public listen(port: number = 5000, callback?: () => void) {
    this._nodeServer.listen(port, () => {
      // TODO: logging stuff...
      console.info(`Server is listening on port ${port}`);

      callback?.();
    });

    return this;
  }

  public create() {
    this._nodeServer = http.createServer(async (req, res) => {
      const url = req.url;
      const method = req.method;

      const request = new Request(req);
      const response = new Response(res) as Response;

      const parsedUrl = url?.split('?');
      request.query = RequestParser.parseQuery(parsedUrl?.[1]);
      request.body = await RequestParser.parseBody(req);

      const registeredRoutes = this.router.getRoutes();

      const routes = [...registeredRoutes];

      // TODO: URL matching with route params
      const matchingRoute = routes.find(
        route =>
          url === route.getPath() &&
          (route.getMethod() === method || route.getMethod() === RequestMethod.ALL),
      );

      if (registeredRoutes.size === 0 || !matchingRoute) {
        res.writeHead(404);
        return res.end('404');
      }

      console.log(`matched ${method} ${url}`);

      this.registerMiddlewares();

      const routeHandler = matchingRoute.getHandler();
      const controller = matchingRoute.getController();

      const args: unknown[] = [];

      // QUERY PARAM DECORATOR
      const queryMetadata =
        Reflect.getMetadata(
          QUERY_PARAM_METADATA,
          controller,
          matchingRoute.getName(),
        ) ?? [];

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
        Reflect.getMetadata(
          BODY_PARAM_METADATA,
          controller,
          matchingRoute.getName(),
        ) ?? [];

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

      // TODO: refactor DI and create a method in the DI container (possibly recursive...)
      //#region DI
      for (const deptInjectionData of deptInjectionMetadata) {
        const classToInject = InjectionContainer.getInstance().find(
          deptInjectionData.type.name,
        );

        if (!classToInject) {
          throw new Error(`${deptInjectionData.type.name} not found`);
        }

        const formedDeps = [];

        for (const dep of classToInject.deps) {
          const depClass = InjectionContainer.getInstance().find(
            (dep as unknown as Function).name,
          );

          if (!depClass) continue;

          const classDeps = [];
          if (depClass?.deps.length) {
            classDeps.push(
              ...depClass.deps.map(d => new (d as unknown as Constructor)()),
            );
          }

          formedDeps.push(new depClass.target(...classDeps));
        }

        args[deptInjectionData.parameterIndex] = new classToInject.target(
          ...formedDeps,
        );

        console.log({ args });
        //#endregion DI
      }

      // console.log({
      //   queryMetadata,
      //   bodyMetadata,
      //   deptInjectionMetadata,
      //   returnType: Reflect.getMetadata(
      //     'design:returntype',
      //     controller,
      //     matchingRoute.getName(),
      //   ).name,
      //   args,
      // });

      // HEADER DECORATOR
      const headersMetadata = Reflect.getMetadata(
        HEADERS_METADATA,
        controller,
        matchingRoute.getName(),
      );

      const headers = headersMetadata?.reduce(
        (acc: { [key: string]: string }, header: { [key: string]: string }) => {
          acc[header.name] = header.value;
          return acc;
        },
        {},
      );

      const statusCodeMetadata = Reflect.getMetadata(
        HTTP_STATUS_CODE_METADATA,
        controller,
        matchingRoute.getName(),
      );

      const statusCode = statusCodeMetadata ?? 200;

      let endResponse = await routeHandler(...args);

      response.status(statusCode).setHeaders(headers);

      if (endResponse instanceof Object && !endResponse.headers) {
        endResponse = JSON.stringify(endResponse);
        response.setHeader('Content-Type', 'application/json');
      } else if (endResponse instanceof Object && endResponse.headers) {
        response.setHeaders(endResponse.headers);
        endResponse = endResponse.body;
      }

      console.log(endResponse);

      return response.send(endResponse);
    });
  }

  public get nodeServer() {
    return this._nodeServer;
  }

  public addInjectable(type: string, element: object) {
    // add to the dependency injection container

    return this;
  }
}

export default new App();
