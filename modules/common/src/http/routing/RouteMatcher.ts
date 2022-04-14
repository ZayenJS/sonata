import { RequestMethod } from '../../enums/request-methods.enum';
import { MatchedRoute } from './MatchedRoute';
import { Route, RouteParam } from './Route';
import { RouteMatcherInterface } from './RouteMatcherInterface';

export interface MatchingRoute {
  route: Route;
  params: RouteParam[];
}

export class RouteMatcher implements RouteMatcherInterface {
  public constructor() {}

  public match(path: string, method: RequestMethod, routes: Route[]): MatchingRoute | null {
    console.log(`RouteMatcher.match()`);
    console.log(`path: ${path}`);
    console.log(`method: ${method}`);

    for (const route of routes) {
      const isSameRoute = this.isSameRoute(route, path, method);

      if (!isSameRoute) {
        continue;
      }

      const routeParams = this.searchForRouteParams(path, route);

      return {
        route,
        params: routeParams,
      };
    }

    return null;
  }

  private searchForRouteParams(path: string, route: Route): RouteParam[] {
    const routePath = route.getPath();
    const routePathParts = routePath.split('/');
    const pathParts = path.split('/');

    const routeParams: RouteParam[] = [];

    for (let i = 0; i < routePathParts.length; i++) {
      const routePathPart = routePathParts[i];
      const pathPart = pathParts[i];

      if (routePathPart.startsWith(':')) {
        const isNumberish = /^\d+$/.test(pathPart);

        const routeParam: RouteParam = {
          name: routePathPart.substring(1),
          value: isNumberish ? +pathPart : pathPart,
        };

        routeParams.push(routeParam);
      }
    }

    return routeParams;
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
