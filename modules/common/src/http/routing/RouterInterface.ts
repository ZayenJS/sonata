import { RequestMethod } from '../../enums/request-methods.enum';
import { Route, RouteOptions } from './Route';
import { Router } from './Router';

export interface RouterInterface {
  routes: Set<Route>;

  addRoute(route: Route): Router;
  getRoute(name: string): Route | undefined;
  getRouteByPath(path: string): Route | undefined;
  get(path: string, handler: Function, controller: any, options: RouteOptions): Router;
  post(path: string, handler: Function, controller: any, options: RouteOptions): Router;
  put(path: string, handler: Function, controller: any, options: RouteOptions): Router;
  patch(path: string, handler: Function, controller: any, options: RouteOptions): Router;
  delete(path: string, handler: Function, controller: any, options: RouteOptions): Router;
  options(path: string, handler: Function, controller: any, options: RouteOptions): Router;
  head(path: string, handler: Function, controller: any, options: RouteOptions): Router;
  options(path: string, handler: Function, controller: any, options: RouteOptions): Router;
  all(path: string, handler: Function, controller: any, options: RouteOptions): Router;
}
