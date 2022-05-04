import { CONTROLLER_METADATA } from '../constants';
import { Constructor } from '../Injection/InjectionContainer';
import { extendMetadataArray } from '../utils';

export const Controller = (routePrefix?: string) => (target: Constructor) => {
  if (!routePrefix) {
    return;
  }

  // FIXME: This isn't working, can't get the metadata
  Reflect.defineMetadata(CONTROLLER_METADATA, { routePrefix }, target);

  // TODO: logging here to see if the controller was registered
  console.log(`Controller ${target.name} registered`);
};
