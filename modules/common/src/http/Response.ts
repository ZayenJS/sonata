import { ServerResponse, OutgoingHttpHeaders } from 'http';
import { HttpStatus } from '../enums/http-status.enum';
import fs from 'fs';
import { CookieOptions } from './Cookie';
import { isRedirectStatus } from '../utils';
import { config } from '../Config/Config';
import path from 'path';

export interface HttpResponse {
  status?: HttpStatus;
  body: string;
  headers?: OutgoingHttpHeaders;
}

export class Response {
  private _responseSent = false;
  private _status: number = 200;
  private _defaultHeaders: OutgoingHttpHeaders = {
    'Content-Type': 'text/html',
  };
  private _headers: OutgoingHttpHeaders = {};
  private _data: string = '';
  private _cookies: { [key: string]: string } = {};

  constructor(private _res: ServerResponse, data?: string) {
    this._data = data ?? '';
    this._headers = { ...this._defaultHeaders };
  }

  public send(data?: string) {
    if (!this._responseSent) {
      this._responseSent = true;
      this._res.writeHead(this._status, this._headers);
      this._res.end(data ?? this._data);
    }
  }

  public render(template: string, data?: { [key: string]: any }) {}

  public sendFile(filePath: string) {
    if (!this._responseSent) {
      this._responseSent = true;

      this._res.writeHead(this._status, this._headers);
      this._res.end(fs.readFileSync(filePath));
    }
  }

  public redirect(url: string, status?: HttpStatus) {
    if (!this._responseSent) {
      const redirectStatus =
        status && isRedirectStatus(status) ? status : HttpStatus.MOVED_PERMANENTLY;
      this.status(redirectStatus).setHeader('Location', url).send();
    }
  }

  public status(status?: HttpStatus) {
    if (!status) return this;

    if (status in HttpStatus) {
      this._status = status;
      return this;
    }

    throw new Error(`${status} is not a valid status code`);
  }

  public get headers(): OutgoingHttpHeaders {
    return this._headers;
  }

  public get statusCode() {
    return this._status;
  }

  public get cookies() {
    return this._cookies;
  }

  public getCookie(name: string) {
    return this._cookies[name];
  }

  public setCookie(name: string, value: string, options?: CookieOptions) {
    this._cookies[name] = `${name}=${value}; ${this._getCookieOptions(options)}`;

    this.setHeader('Set-Cookie', Object.values(this._cookies));

    return this;
  }

  private _getCookieOptions(options?: CookieOptions) {
    if (!options) return '';

    const cookieOptions = [];

    for (const key in options) {
      const value = options[key as keyof CookieOptions];

      if (options.hasOwnProperty(key)) {
        cookieOptions.push(`${key}=${value}`);
      }
    }

    return cookieOptions.join('; ');
  }

  public deleteCookie(name: string) {
    this.setCookie(name, '', {
      expires: new Date(0),
    });
  }

  public setHeader(name?: string, value?: string | string[]) {
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
