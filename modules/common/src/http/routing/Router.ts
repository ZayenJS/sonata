import { RequestMethod } from '../../enums/request-methods.enum';
import { Request } from '../Request';
import { Route, RouteOptions } from './Route';
import { RouteMatcher } from './RouteMatcher';
import { RouterInterface } from './RouterInterface';

export class Router implements RouterInterface {
  private _request?: Request;
  private _routeMatcher: RouteMatcher = new RouteMatcher();
  private _routes: Set<Route> = new Set();

  public get routes() {
    return this._routes;
  }

  public set request(request: Request) {
    this._request = request;
  }

  public addRoute(route: Route) {
    this._routes.add(route);

    return this;
  }

  public getRoute(name: string): Route | undefined {
    return [...this._routes].find((route: Route) => route.getName() === name);
  }

  public getRouteByPath(path: string): Route | undefined {
    return [...this._routes].find((route: Route) => route.getPath() === path);
  }

  public get routesLength(): number {
    return this._routes.size;
  }

  public getMatchingRoute(): Route | null {
    if (!this._request) {
      throw new Error('Request is not set');
    }

    const matchingRoute = this._routeMatcher.match(this._request.url, this._request.method, [
      ...this._routes,
    ]);

    if (matchingRoute) {
      return matchingRoute;
    }

    return null;
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

  public post(
    path: string,
    handler: Function,
    controller: any,
    options: RouteOptions,
  ): Router {
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

  public patch(
    path: string,
    handler: Function,
    controller: any,
    options: RouteOptions,
  ): Router {
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

  public delete(
    path: string,
    handler: Function,
    controller: any,
    options: RouteOptions,
  ): Router {
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

  public options(
    path: string,
    handler: Function,
    controller: any,
    options: RouteOptions,
  ): Router {
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

  public head(
    path: string,
    handler: Function,
    controller: any,
    options: RouteOptions,
  ): Router {
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
