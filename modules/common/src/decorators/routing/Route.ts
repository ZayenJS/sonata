import { RequestMethod } from '../../enums/request-methods.enum';
import { Response } from '../../http/Response';
import { Route as RouteClass } from '../../http/routing/Router';
import app from '../../App';

interface RouteOptions {
  methods: RequestMethod[];
}

export function Route(
  path: string,
  options: RouteOptions = { methods: [RequestMethod.ALL] },
) {
  return function (target: Object, propertyName: string, descriptor: PropertyDescriptor) {
    // TODO: Logging
    console.info(`Route ${path} registered`);
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      return originalMethod.apply(target, args);
    };

    const ownMetadataKeys = Reflect.getOwnMetadataKeys(target, propertyName);

    for (const key of ownMetadataKeys) {
      if (key.includes('#')) {
        const metadata = Reflect.getOwnMetadata(key, target, propertyName);
        Reflect.defineMetadata(key, metadata, target, propertyName);
      }
    }

    for (const method of options.methods) {
      const route = new RouteClass({
        method,
        path,
        handler: descriptor.value,
        controller: target,
        routeName: propertyName,
      });

      app.router.addRoute(route);
    }
  };
}
