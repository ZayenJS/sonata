import { randomUUID, createHash } from 'crypto';
import { GenericObject } from '../@types';

export class Session {
  private _id: string = randomUUID();
  private _name: string = 'SONATA_SESSID';
  private _user?: any;
  private _token: string = '';
  private _createdAt: Date = new Date();
  private _updatedAt: Date = new Date();

  private static _sessions: Map<string, Session> = new Map();

  private readonly _store: Map<string, unknown> = new Map();

  public static get sessions() {
    return Session._sessions;
  }

  constructor() {
    this._token = Session._generateToken();
  }

  private storeToObject<T>(): T | GenericObject {
    const obj: GenericObject = {};

    this._store.forEach((value, key) => {
      obj[key] = value;
    });

    return obj as T | GenericObject;
  }

  public save() {
    Session.sessions.set(this.id, this);

    return this;
  }

  public getStore<T>(): T | GenericObject {
    return this.storeToObject();
  }

  public add(key: string, value: unknown) {
    this._store.set(key, value);
    this.save();

    return this;
  }

  private static _generateToken(): string {
    return createHash('sha256').update(randomUUID()).digest('hex');
  }

  public get id(): string {
    return this._id;
  }

  public set id(id: string) {
    this._id = id;
  }

  public get name(): string {
    return this._name;
  }

  public get user(): any | undefined {
    return this._user;
  }

  public set user(user: any) {
    this._user = user;

    this.save();
  }

  public get token(): string {
    return this._token;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
