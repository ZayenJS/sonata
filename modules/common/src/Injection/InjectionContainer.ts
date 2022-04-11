import { InjectionType } from '../enums/InjectionType';

/**
 * InjectionContainer class
 * @class
 * @classdesc Dependency injection container to store all the injectable classes
 * @author David Nogueira
 * @since 0.0.1
 * @singleton
 * @hideconstructor
 */
export class InjectionContainer {
  private static _instance?: InjectionContainer;
  private _injectables: Map<string, any>;

  private constructor() {
    this._injectables = new Map();
  }

  public static getInstance(): InjectionContainer {
    if (!InjectionContainer._instance) {
      InjectionContainer._instance = new InjectionContainer();
    }

    return InjectionContainer._instance;
  }

  public add(type: InjectionType, name: string, value: any) {
    this._injectables.set(`${type}-${name}`, value);

    return this;
  }

  public get(type: InjectionType, name: string) {
    return this._injectables.get(`${type}-${name}`);
  }

  public has(type: InjectionType, name: string) {
    return this._injectables.has(`${type}-${name}`);
  }

  public remove(type: InjectionType, name: string) {
    this._injectables.delete(`${type}-${name}`);

    return this;
  }

  public clear() {
    this._injectables.clear();

    return this;
  }

  public get size() {
    return this._injectables.size;
  }

  public get values() {
    return this._injectables.values();
  }

  public get keys() {
    return this._injectables.keys();
  }

  public get entries() {
    return this._injectables.entries();
  }

  public getInjectables() {
    return this._injectables;
  }
}
