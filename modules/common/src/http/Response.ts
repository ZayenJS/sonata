import { ServerResponse, OutgoingHttpHeaders } from 'http';
import { HttpStatus } from '../enums/http-status.enum';

export interface HttpResponse {
  status?: HttpStatus;
  body: string;
  headers?: OutgoingHttpHeaders;
}

export class Response {
  private _status: number = 200;
  private _defaultHeaders: OutgoingHttpHeaders = {
    'Content-Type': 'text/html',
  };
  private _headers: OutgoingHttpHeaders = {};
  private _data: string = '';

  constructor(private _res: ServerResponse, data?: string) {
    this._data = data ?? '';
    this._headers = { ...this._defaultHeaders };
  }

  public send(data?: string) {
    this._res.writeHead(this._status, this._headers);
    this._res.end(data ?? this._data);
  }

  public status(status?: HttpStatus) {
    if (!status) return this;

    if (status in HttpStatus) {
      this._status = status;
      return this;
    }

    throw new Error(`${status} is not a valid status code`);
  }

  public setHeader(name?: string, value?: string) {
    if (!name || !value) return this;

    if (!this._headers) this._headers = {};

    this._headers[name] = value;

    return this;
  }

  public appendHeaders(headers: OutgoingHttpHeaders) {
    this._headers = { ...this._headers, ...headers };

    return this;
  }

  public setHeaders(headers: OutgoingHttpHeaders) {
    this._headers = headers;

    return this;
  }

  public deleteHeader(name: string) {
    delete this._headers[name];

    return this;
  }

  public resetHeaders() {
    this._headers = { ...this._defaultHeaders };

    return this;
  }
}
