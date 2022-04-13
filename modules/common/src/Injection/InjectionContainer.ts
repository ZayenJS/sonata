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

export interface Constructor {
  new (...args: any[]): any;
  prototype: any;
}

export interface InjectableMetadata {
  type: InjectionType;
  name: string;
  deps: InjectableDependencyMetadata[];
  target: Constructor;
}

export interface InjectableDependencyMetadata {
  class: Constructor;
  index: number;
}

interface Injectable {
  deps: InjectableDependencyMetadata[];
  target: Constructor;
}

type InjectablesMap = {
  [key in InjectionType]: Map<string, Injectable>;
};

export class InjectionContainer {
  private static _instance?: InjectionContainer;
  private _injectables: InjectablesMap = {
    [InjectionType.CLASS]: new Map(),
    [InjectionType.CONTROLLER]: new Map(),
    [InjectionType.SERVICE]: new Map(),
    [InjectionType.ENTITY]: new Map(),
  };

  private constructor() {}

  public static getInstance(): InjectionContainer {
    if (!InjectionContainer._instance) {
      InjectionContainer._instance = new InjectionContainer();
    }

    return InjectionContainer._instance;
  }

  public add(injectableDetails: InjectableMetadata) {
    const { type, name, deps, target } = injectableDetails;

    this._injectables[type].set(name, { deps, target });

    return this;
  }

  public get(type: InjectionType, name: string) {
    return this._injectables[type].get(name);
  }

  public find(name: string) {
    for (const type in this._injectables) {
      if (this._injectables[type as InjectionType].has(name)) {
        return this._injectables[type as InjectionType].get(name);
      }
    }

    return undefined;
  }

  public has(type: InjectionType, name: string) {
    return this._injectables[type].has(name);
  }

  public remove(type: InjectionType, name: string) {
    this._injectables[type].delete(`${type}-${name}`);

    return this;
  }

  public clear(): this;
  public clear(type: InjectionType): this;
  public clear(type?: InjectionType) {
    if (type) {
      this._injectables[type].clear();
      return this;
    }

    for (const type in this._injectables) {
      this._injectables[type as InjectionType].clear();
    }

    return this;
  }

  public size(): number;
  public size(type: InjectionType): number;
  public size(type?: InjectionType) {
    if (type) {
      return this._injectables[type].size;
    }

    let size = 0;

    for (const type in this._injectables) {
      size += this._injectables[type as InjectionType].size;
    }

    return size;
  }

  public values(): Map<string, Injectable>[];
  public values(type: InjectionType): IterableIterator<Injectable>;
  public values(
    type?: InjectionType,
  ): Map<string, Injectable>[] | IterableIterator<Injectable> {
    if (type) {
      return this._injectables[type].values();
    }

    return Object.values(this._injectables);
  }

  public keys(): string[];
  public keys(type: InjectionType): string[];
  public keys(type?: InjectionType) {
    if (type) {
      return this._injectables[type].keys();
    }

    return Object.keys(this._injectables);
  }

  public entries(): [string, Map<string, InjectableMetadata>][];
  public entries(
    type: InjectionType,
  ): IterableIterator<[string, InjectableMetadata]>;
  public entries(type?: InjectionType) {
    if (type) {
      return this._injectables[type].entries();
    }

    return Object.entries(this._injectables);
  }

  public getInjectables() {
    return this._injectables;
  }
}
