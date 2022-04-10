import { RequestMethod } from '../../enums/request-methods.enum';

interface RouteInitParams {
  method: RequestMethod;
  path: string;
  handler: Function;
  controller: any;
}

interface RouteOptions {
  routeName: string;
}

export class Route {
  private method: RequestMethod;
  private path: string;
  private handler: Function;
  private routeName: string;
  private controller: any;

  constructor(params: RouteInitParams & RouteOptions) {
    this.method = params.method;
    this.path = params.path;
    this.handler = params.handler;
    this.routeName = params.routeName;
    this.controller = params.controller;
  }

  public getMethod() {
    return this.method;
  }

  public getPath() {
    return this.path;
  }

  public getHandler() {
    return this.handler;
  }

  public getName() {
    return this.routeName;
  }

  public getController() {
    return this.controller;
  }
}

export class Router {
  private routes: Set<Route> = new Set();

  constructor(routes?: Set<Route>) {
    if (routes) {
      this.routes = routes;
    }
  }

  public getRoutes() {
    return this.routes;
  }

  public addRoute(route: Route) {
    this.routes.add(route);

    return this;
  }

  public get(path: string, handler: Function, controller: any, options: RouteOptions): Router {
    this.addRoute(
      new Route({
        method: RequestMethod.GET,
        path,
        handler,
        controller,
        routeName: options?.routeName,
      }),
    );

    return this;
  }

  public post(path: string, handler: Function, controller: any, options: RouteOptions): Router {
    this.addRoute(
      new Route({
        method: RequestMethod.POST,
        path,
        handler,
        controller,
        routeName: options?.routeName,
      }),
    );

    return this;
  }

  public put(path: string, handler: Function, controller: any, options: RouteOptions): Router {
    this.addRoute(
      new Route({
        method: RequestMethod.PUT,
        path,
        handler,
        controller,
        routeName: options?.routeName,
      }),
    );

    return this;
  }

  public patch(path: string, handler: Function, controller: any, options: RouteOptions): Router {
    this.addRoute(
      new Route({
        method: RequestMethod.PATCH,
        path,
        handler,
        controller,
        routeName: options?.routeName,
      }),
    );

    return this;
  }

  public delete(path: string, handler: Function, controller: any, options: RouteOptions): Router {
    this.addRoute(
      new Route({
        method: RequestMethod.DELETE,
        path,
        handler,
        controller,
        routeName: options?.routeName,
      }),
    );

    return this;
  }

  public options(path: string, handler: Function, controller: any, options: RouteOptions): Router {
    this.addRoute(
      new Route({
        method: RequestMethod.OPTIONS,
        path,
        handler,
        controller,
        routeName: options?.routeName,
      }),
    );

    return this;
  }

  public head(path: string, handler: Function, controller: any, options: RouteOptions): Router {
    this.addRoute(
      new Route({
        method: RequestMethod.HEAD,
        path,
        handler,
        controller,
        routeName: options?.routeName,
      }),
    );

    return this;
  }

  public all(path: string, handler: Function, controller: any, options: RouteOptions): Router {
    this.get(path, handler, controller, options);
    this.post(path, handler, controller, options);
    this.put(path, handler, controller, options);
    this.patch(path, handler, controller, options);
    this.delete(path, handler, controller, options);
    this.options(path, handler, controller, options);
    this.head(path, handler, controller, options);

    return this;
  }
}
