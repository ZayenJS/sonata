import { RequestMethod } from '../../enums/request-methods.enum';
import { Route } from './Route';
import { MatchingRoute } from './RouteMatcher';
import { Router } from './Router';

export interface RouteMatcherInterface {
  match(path: string, method: RequestMethod, routes: Route[]): MatchingRoute | null;
}
