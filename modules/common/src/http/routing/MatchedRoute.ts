import { RequestMethod } from '../../enums/request-methods.enum';
import { RequestParser } from '../../Helpers/RequestParser';
import { Route, RouteInterface, RouteParam } from './Route';
import { MatchingRoute } from './RouteMatcher';

export class MatchedRoute implements RouteInterface, MatchingRoute {
  public constructor(private readonly _route: Route, private readonly _params: RouteParam[]) {}

  public get route(): Route {
    return this._route;
  }

  public get params(): RouteParam[] {
    return this._params;
  }

  public getHandler(): Function {
    return this._route.getHandler();
  }

  public getController(): any {
    return this._route.getController();
  }

  public getName(): string {
    return this._route.getName();
  }

  public getPath(): string {
    return this._route.getPath();
  }

  public getMethod(): RequestMethod {
    return this._route.getMethod();
  }

  public extractParams(): string[] {
    return [];
  }

  public extractQueryParams(): URLSearchParams {
    const path = this._route.getPath();
    const parsedUrl = path.split('?');
    return RequestParser.parseQuery(parsedUrl?.[1]);
  }
}
