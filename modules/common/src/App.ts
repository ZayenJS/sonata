import http, { Server } from 'http';
import path from 'path';
import {
  BODY_PARAM_METADATA,
  DEPT_INJECTION_METADATA,
  HEADERS_METADATA,
  HTTP_STATUS_CODE_METADATA,
  QUERY_PARAM_METADATA,
  REDIRECT_METADATA,
  RENDER_METADATA,
  ROUTE_PARAM_METADATA,
} from './constants';
import { HttpStatus } from './enums/http-status.enum';
import { FS } from './Helpers/FS';
import { RequestParser } from './Helpers/RequestParser';
import { Request } from './http/Request';
import { Response } from './http/Response';

import { Router } from './http/routing/Router';
import { Constructor, InjectionContainer } from './Injection/InjectionContainer';

// TODO: expose a wrapper of the App class to the outside world

export class App {
  private _router: Router;
  private _nodeServer: http.Server = new Server();
  private config = new URLSearchParams({
    views: `${FS.findRootDirectory()}/views`,
  });

  constructor() {
    this._router = new Router();
  }

  public set(key: string, value: string) {
    this.config.set(key, value);
  }

  public get router(): Router {
    return this._router;
  }

  private set router(router: Router) {
    this._router = router;
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
      let incompleteRequest = false;

      if (!req.url) incompleteRequest = true;
      if (!req.method) incompleteRequest = true;

      if (incompleteRequest) {
        res.writeHead(HttpStatus.BAD_REQUEST, { 'Content-Type': 'text/plain' });
        res.end('Bad Request');
        return;
      }

      const request = new Request(req);
      const response = new Response(res) as Response;
      this.router.request = request;

      const matchingRoute = this.router.getMatchingRoute();

      if (!this.router.routesLength || !matchingRoute) {
        // TODO: expose a 404 page to the user to be Customized
        res.writeHead(404);
        return res.end('404');
      }

      const { queryParams, routeParams } = matchingRoute.extractParams(request.url);

      request.query = queryParams;
      request.params = routeParams;
      request.body = await RequestParser.parseBody(req);

      this.registerMiddlewares();

      const routeHandler = matchingRoute.getHandler();
      const controller = matchingRoute.getController();

      // TODO: Get the position of the route param args with the use of the @Param() decorator
      const args: unknown[] = [...request.params.values()];

      // QUERY PARAM DECORATOR
      const queryMetadata =
        Reflect.getMetadata(QUERY_PARAM_METADATA, controller, matchingRoute.getName()) ?? [];

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
        Reflect.getMetadata(BODY_PARAM_METADATA, controller, matchingRoute.getName()) ?? [];

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

      // ROUTE PARAM DECORATOR
      const routeParamMetadata =
        Reflect.getMetadata(ROUTE_PARAM_METADATA, controller, matchingRoute.getName()) ?? [];

      for (const routeParamData of routeParamMetadata) {
        const routeParams = request.params;

        args[routeParamData.parameterIndex] = routeParams.get(routeParamData.name);
      }

      // DEPENDENCY INJECTION
      const deptInjectionMetadata =
        Reflect.getMetadata(DEPT_INJECTION_METADATA, controller, matchingRoute.getName()) ??
        [];

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
            classDeps.push(...depClass.deps.map(d => new (d as unknown as Constructor)()));
          }

          formedDeps.push(new depClass.target(...classDeps));
        }

        args[deptInjectionData.parameterIndex] = new classToInject.target(...formedDeps);

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

      // STATUS CODE DECORATOR
      const statusCodeMetadata = Reflect.getMetadata(
        HTTP_STATUS_CODE_METADATA,
        controller,
        matchingRoute.getName(),
      );

      const statusCode = statusCodeMetadata ?? 200;
      console.log({ args });

      let endResponse = await routeHandler(...args);

      response.status(statusCode).setHeaders(headers);

      // REDIRECT DECORATOR
      const redirectMetadata = Reflect.getMetadata(
        REDIRECT_METADATA,
        controller,
        matchingRoute.getName(),
      );

      // RENDER DECORATOR
      const renderMetadata = Reflect.getMetadata(
        RENDER_METADATA,
        controller,
        matchingRoute.getName(),
      );

      if (renderMetadata) {
        const templateName = renderMetadata;
        const templatePath = path.join(this.config.get('views')!, templateName);

        // if (!fs.existsSync(templatePath)) {
        //   throw new Error(`${templatePath} not found`);
        // }

        // const templateContent = fs.readFileSync(templatePath, 'utf8');
        // const templateEngine = new TemplateEngine(templateContent);

        // endResponse = templateEngine.render(data);
        return response.sendFile(templatePath);
      }

      if (redirectMetadata) {
        response.redirect(redirectMetadata.url, redirectMetadata.statusCode);
        return;
      }

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
