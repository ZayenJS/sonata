import { IncomingHttpHeaders, IncomingMessage } from 'http';
import { GenericObject, GenericStringObject } from '../@types';
import { RequestMethod } from '../enums/request-methods.enum';
import { Cookie } from './Cookie';
import { Session } from './Session';

export class Request {
  private _session: Session;
  private _cookies: Set<Cookie> = new Set();
  private _body: GenericStringObject = {};
  private _params: GenericStringObject = {};
  private _query: GenericStringObject = {};
  private _headers: IncomingHttpHeaders;

  constructor(private _request: IncomingMessage) {
    this._headers = this._request.headers;
    this._session = new Session();
  }

  public getCookies<T>() {
    return this._cookies as unknown as T;
  }

  public get cookies() {
    this._request.headers.cookie?.split(';').forEach(cookie => {
      const [key, value] = cookie.split('=').map(item => item.trim());
      this._cookies.add(new Cookie(key, value));
    });

    return [...this._cookies];
  }

  public get session() {
    return this._session;
  }

  public set session(session: Session) {
    this._session = session;
    //@ts-ignore
    this._request.session = session;
  }

  public getBody<T>() {
    return this._body as unknown as T;
  }

  public set body(body: GenericStringObject) {
    this._body = body;
  }

  public getParams<T>() {
    return this._params as unknown as T;
  }

  public get params() {
    return this._params;
  }

  public set params(params: GenericStringObject) {
    this._params = params;
  }

  public getQuery<T>() {
    return this._query as unknown as T;
  }

  public set query(query: GenericStringObject) {
    this._query = query;
  }

  public get headers() {
    return this._headers;
  }

  public get url() {
    return this._request.url as string;
  }

  public get method() {
    return this._request.method as RequestMethod;
  }
}
