import { GenericObject } from '../@types';
import {
  BODY_PARAM_METADATA,
  DEPT_INJECTION_METADATA,
  HEADERS_METADATA,
  HTTP_STATUS_CODE_METADATA,
  QUERY_PARAM_METADATA,
  ROUTE_PARAM_METADATA,
} from '../constants';
import { InjectionType } from '../enums/InjectionType';
import { Logger } from '../Helpers/Logger';
import { Request } from '../http/Request';
import { Response } from '../http/Response';
import { isNumberish } from '../utils';

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

interface InjectionContainerStore {
  toBeInjectedParams: unknown[];
}

type InjectablesMap = {
  [key in InjectionType]: Map<string, Injectable>;
};

export class InjectionContainer {
  private static _instance?: InjectionContainer;
  private _injectables: InjectablesMap = {
    [InjectionType.REPOSITORY]: new Map(),
    [InjectionType.CONTROLLER]: new Map(),
    [InjectionType.SERVICE]: new Map(),
    [InjectionType.ENTITY]: new Map(),
  };

  private _store: InjectionContainerStore = {
    toBeInjectedParams: [],
  };

  public set(key: string, value: any) {
    this._store[key as keyof InjectionContainerStore] = value;

    return this;
  }

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
  public entries(type: InjectionType): IterableIterator<[string, InjectableMetadata]>;
  public entries(type?: InjectionType) {
    if (type) {
      return this._injectables[type].entries();
    }

    return Object.entries(this._injectables);
  }

  public getInjectables() {
    return this._injectables;
  }

  public getInjectable(type: InjectionType, name: string) {
    return this._injectables[type].get(name);
  }

  public getInjectableNames(type: InjectionType) {
    return this._injectables[type].keys();
  }

  public getInjectableTypes() {
    return Object.keys(this._injectables);
  }

  public getInjectableArgs() {
    return this._store.toBeInjectedParams.map(param => (isNumberish(param) ? +param : param));
  }

  public injectQueryParams(request: Request, target: object, propertyKey: string) {
    const queryMetadata = Reflect.getMetadata(QUERY_PARAM_METADATA, target, propertyKey) ?? [];
    for (const queryData of queryMetadata) {
      let queryParam: any = request.query[queryData.name];

      if (!queryData.name) {
        queryParam = {};

        Object.entries(request.query).forEach(([key, value]) => {
          queryParam[key] = value;
        });
      }

      this._store.toBeInjectedParams[queryData.parameterIndex] = queryParam;
    }

    return this;
  }

  public injectBodyParams(request: Request, target: object, propertyKey: string) {
    const bodyMetadata = Reflect.getMetadata(BODY_PARAM_METADATA, target, propertyKey) ?? [];

    for (const bodyData of bodyMetadata) {
      let bodyParam: any = request.body[bodyData?.name];

      if (!bodyData.name) {
        bodyParam = {};

        Object.entries(request.body).forEach(([key, value]) => {
          bodyParam[key] = value;
        });
      }

      this._store.toBeInjectedParams[bodyData.parameterIndex] = bodyParam;
    }

    return this;
  }

  public injectRouteParams(request: Request, target: object, propertyKey: string) {
    const routeParamMetadata =
      Reflect.getMetadata(ROUTE_PARAM_METADATA, target, propertyKey) ?? [];

    for (const routeParamData of routeParamMetadata) {
      const routeParams = request.params;

      this._store.toBeInjectedParams[routeParamData.parameterIndex] =
        routeParams[routeParamData.name];
    }

    return this;
  }

  public getHeadersMetadata(request: Request, target: object, propertyKey: string) {
    const headersMetadata = Reflect.getMetadata(HEADERS_METADATA, target, propertyKey);

    return headersMetadata?.reduce(
      (acc: { [key: string]: string }, header: { [key: string]: string }) => {
        acc[header.name] = header.value;
        return acc;
      },
      {},
    );
  }

  public getStatusCodeMetadata(target: object, propertyKey: string) {
    const statusCodeMetadata = Reflect.getMetadata(
      HTTP_STATUS_CODE_METADATA,
      target,
      propertyKey,
    );

    return statusCodeMetadata ?? 200;
  }

  public injectDependencies(
    request: Request,
    response: Response,
    target: object,
    propertyKey: string,
  ) {
    const deptInjectionMetadata =
      Reflect.getMetadata(DEPT_INJECTION_METADATA, target, propertyKey) ?? [];

    // TODO: refactor DI and create a method in the DI container (possibly recursive...)
    //#region DI
    for (const deptInjectionData of deptInjectionMetadata) {
      if (deptInjectionData.type.name.toLowerCase() === 'request') {
        this._store.toBeInjectedParams[deptInjectionData.parameterIndex] = request;
        continue;
      } else if (deptInjectionData.type.name.toLowerCase() === 'response') {
        this._store.toBeInjectedParams[deptInjectionData.parameterIndex] = response;
        continue;
      }

      const classToInject = InjectionContainer.getInstance().find(deptInjectionData.type.name);

      if (!classToInject) {
        throw new Error(`${deptInjectionData.type.name} not found`);
      }

      const formedDeps = [];

      for (const dep of classToInject.deps) {
        const depClass = InjectionContainer.getInstance().find(
          (dep as unknown as Function).name,
        );

        if (!depClass) continue;

        const classDeps = [];
        if (depClass?.deps.length) {
          classDeps.push(...depClass.deps.map(d => new (d as unknown as Constructor)()));
        }

        formedDeps.push(new depClass.target(...classDeps));
      }

      this._store.toBeInjectedParams[deptInjectionData.parameterIndex] =
        new classToInject.target(...formedDeps);

      //#endregion DI
    }
  }
}
