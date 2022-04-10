import { IncomingHttpHeaders, IncomingMessage } from 'http';

export class Request {
  private _body: URLSearchParams;
  private _params: URLSearchParams;
  private _query: URLSearchParams;
  private _headers: IncomingHttpHeaders;

  constructor(private _request: IncomingMessage) {
    this._body = new URLSearchParams();
    this._params = new URLSearchParams();
    this._query = new URLSearchParams();
    this._headers = this._request.headers;
  }

  public get body() {
    return this._body;
  }

  public set body(body: URLSearchParams) {
    this._body = body;
  }

  public get params() {
    return this._params;
  }

  public set params(params: URLSearchParams) {
    this._params = params;
  }

  public get query() {
    return this._query;
  }

  public set query(query: URLSearchParams) {
    this._query = query;
  }

  public get headers() {
    return this._headers;
  }
}
