import { RequestMethod } from '../../enums/request-methods.enum';
import { Route } from './Route';

export interface RouteMatcherInterface {
  match(path: string, method: RequestMethod, routes: Route[]): Route | null;
}
