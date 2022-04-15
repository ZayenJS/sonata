import { RequestMethod } from '../../enums/request-methods.enum';
import { Route as RouteClass } from '../../http/routing/Route';
import app from '../../App';
import { extendMetadataArray, isClass } from '../../utils';

interface RouteOptions {
  methods: RequestMethod[];
}

export function Route(path: string, options: RouteOptions = { methods: [RequestMethod.ALL] }) {
  return function (target: object, key: string, descriptor: PropertyDescriptor) {
    // TODO: Logging
    console.info(`Route ${path} registered`);
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      return originalMethod.apply(target, args);
    };

    // console.log(Reflect.getMetadata('design:type', target, key));

    // Gets the classes to be injected
    const classParams = Reflect.getMetadata('design:paramtypes', target, key)
      .map((e: Function, i: number) => (isClass(e) ? { parameterIndex: i, type: e } : null))
      .filter((e: any) => e);

    extendMetadataArray('__DEPENDENCY_INJECTION__', classParams, target, key);

    // console.log(Reflect.getMetadata('design:returntype', target, key));

    for (const method of options.methods) {
      const route = new RouteClass({
        method,
        path,
        handler: descriptor.value,
        controller: target,
        routeName: key,
      });

      app.router.addRoute(route);
    }
  };
}
