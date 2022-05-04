import { RequestMethod } from '../../enums/request-methods.enum';
import { Route as RouteClass } from '../../http/routing/Route';
import app from '../../App';
import { extendMetadataArray, isClass } from '../../utils';
import { Logger } from '../../Helpers/Logger';
import { CONTROLLER_METADATA, DEPT_INJECTION_METADATA } from '../../constants';
import { Constructor } from '../../Injection/InjectionContainer';

interface RouteOptions {
  methods: RequestMethod[];
}

export function Route(path: string, options: RouteOptions = { methods: [RequestMethod.ALL] }) {
  return function (target: object, key: string, descriptor: PropertyDescriptor) {
    // TODO: Logging
    // set timeout is required for the class to be evaluated before the method decorator is.
    // it will give access to the route prefix to set the correct route
    setTimeout(() => {
      const controllerMetadata = Reflect.getOwnMetadata(
        CONTROLLER_METADATA,
        target.constructor,
      );
      let finalPath = path;

      if (controllerMetadata) {
        const { routePrefix } = controllerMetadata;

        if (!path.startsWith('/')) finalPath = `/${routePrefix}/${path}`;
      }

      console.info(`Route ${finalPath} registered`);
      const originalMethod = descriptor.value;

      descriptor.value = (...args: any[]) => originalMethod.apply(target, args);

      // console.log(Reflect.getMetadata('design:type', target, key));

      // Gets the classes to be injected
      const classParams = Reflect.getMetadata('design:paramtypes', target, key)
        .map((e: Function, i: number) => (isClass(e) ? { parameterIndex: i, type: e } : null))
        .filter((e: any) => e);

      extendMetadataArray(DEPT_INJECTION_METADATA, classParams, target, key);

      // console.log(Reflect.getMetadata('design:returntype', target, key));

      for (const method of options.methods) {
        const route = new RouteClass({
          method,
          path: finalPath,
          handler: descriptor.value,
          controller: target,
          routeName: key,
        });

        app.router.addRoute(route);
      }
    });
  };
}
