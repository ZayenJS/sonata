import { RequestMethod } from '../../enums/request-methods.enum';
import { Logger } from '../../Helpers/Logger';
import { Route } from './Route';
import { RouteMatcherInterface } from './RouteMatcherInterface';

export class RouteMatcher implements RouteMatcherInterface {
  public constructor() {}

  public match(path: string, method: RequestMethod, routes: Route[]): Route | null {
    const pathWithoutQueryString = path.split('?')[0];
    for (const route of routes) {
      const isSameRoute = this.isSameRoute(route, pathWithoutQueryString, method);

      if (!isSameRoute) {
        continue;
      }

      Logger.getInstance().custom(
        'RouteMatcher',
        __line,
        `Matching path ${path} with method ${method}`,
      );

      return route;
    }

    return null;
  }

  private isSameRoute(route: Route, path: string, method: RequestMethod): boolean {
    const routeMatch = this.compareRoutePaths(route.getPath(), path);

    if (!routeMatch) {
      return false;
    }

    return route.getMethod() === method || route.getMethod() === RequestMethod.ALL;
  }

  private compareRoutePaths(routePath: string, path: string): boolean {
    const routePathParts = routePath.split('/');
    const pathParts = path.split('/');

    if (routePathParts.length !== pathParts.length) {
      return false;
    }

    for (let i = 0; i < routePathParts.length; i++) {
      const routePathPart = routePathParts[i];
      const pathPart = pathParts[i];

      if (routePathPart.startsWith(':')) {
        continue;
      }

      if (routePathPart !== pathPart) {
        return false;
      }
    }

    return true;
  }
}
