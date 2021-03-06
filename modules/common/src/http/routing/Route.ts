import { RequestMethod } from '../../enums/request-methods.enum';
import { RequestParser } from '../../Helpers/RequestParser';

export interface RouteInitParams {
  method: RequestMethod;
  path: string;
  handler: Function;
  controller: any;
}

export interface RouteOptions {
  routeName: string;
}

export interface URLParams {
  queryParams: URLSearchParams;
  routeParams: URLSearchParams;
}

export interface RouteInterface {
  getMethod(): RequestMethod;
  getPath(): string;
  getHandler(): Function;
  getName(): string;
  getController(): Function;
}

export class Route implements RouteInterface {
  private method: RequestMethod;
  private path: string;
  private handler: Function;
  private routeName: string;
  private controller: any;

  public constructor(params: RouteInitParams & RouteOptions) {
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

  public extractParams(url: string) {
    return RequestParser.parseURL(url, this);
  }
}
