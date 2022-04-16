export interface CookieOptions {
  expires?: Date;
  path?: string;
  domain?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: boolean | 'lax' | 'strict';
  maxAge?: number;
}

export class Cookie {
  public name: string;
  public value: string;
  public expires?: Date;
  public maxAge?: number;
  public domain?: string;
  public path?: string;
  public secure?: boolean;
  public httpOnly?: boolean;
  public sameSite?: boolean | 'lax' | 'strict';

  constructor(name: string, value: string, options: CookieOptions = {}) {
    this.name = name;
    this.value = value;
    this.expires = options?.expires;
    this.maxAge = options?.maxAge;
    this.domain = options?.domain;
    this.path = options?.path ?? '/';
    this.secure = options?.secure ?? false;
    this.httpOnly = options?.httpOnly ?? true;
    this.sameSite = options?.sameSite;
  }
}
