import { INJECTABLE } from '../constants';
import { InjectionType } from '../enums/InjectionType';
import {
  InjectionContainer,
  InjectableMetadata,
  Constructor,
} from '../Injection/InjectionContainer';
import { extendMetadataArray, getClassDependencies } from '../utils';

export const Service = (target: Constructor) => {
  // const deps = getClassDependencies(target);

  // const metadata: InjectableMetadata = {
  //   type: InjectionType.SERVICE,
  //   name: target.name,
  //   deps,
  //   target,
  // };

  // extendMetadataArray(INJECTABLE, [metadata], target);

  // InjectionContainer.getInstance().add(metadata);

  console.info(`Service ${target.name} registered`);
};
