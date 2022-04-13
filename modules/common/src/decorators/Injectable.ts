import App from '../App';
import { INJECTABLE } from '../constants';
import { InjectionType } from '../enums/InjectionType';
import {
  Constructor,
  InjectableMetadata,
  InjectionContainer,
} from '../Injection/InjectionContainer';
import { extendMetadataArray, getClassDependencies } from '../utils';

export const Injectable = (type: InjectionType) => (target: Constructor) => {
  // const deps = getClassDependencies(target);
  // const metadata: InjectableMetadata = {
  //   type,
  //   name: target.name,
  //   deps,
  //   target,
  // };

  // extendMetadataArray(INJECTABLE, [metadata], target);

  // InjectionContainer.getInstance().add(metadata);

  console.info(`Injectable ${type} ${target.name} registered`);
};
