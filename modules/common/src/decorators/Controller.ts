import { INJECTABLE } from '../constants';
import { InjectionType } from '../enums/InjectionType';
import {
  Constructor,
  InjectableMetadata,
  InjectionContainer,
} from '../Injection/InjectionContainer';
import { extendMetadataArray, getClassDependencies } from '../utils';

export const Controller = (routePrefix?: string) => (target: Constructor) => {
  // const deps = getClassDependencies(target);
  // const metadata: InjectableMetadata = {
  //   type: InjectionType.CONTROLLER,
  //   name: target.name,
  //   deps,
  //   target,
  // };

  // extendMetadataArray(INJECTABLE, [metadata], target);

  // // TODO: logging here to see if the controller was registered

  // InjectionContainer.getInstance().add(metadata);

  console.log(`Controller ${target.name} registered`);
};
