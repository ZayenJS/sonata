import App from '../App';
import { INJECTABLE } from '../constants';
import { InjectionType } from '../enums/InjectionType';
import { InjectionContainer } from '../Injection/InjectionContainer';
import { extendMetadataArray } from '../utils';

export function Injectable(type: InjectionType) {
  return (target: Function) => {
    const metadata = {
      type,
      name: target.name,
      target,
    };

    extendMetadataArray(INJECTABLE, [metadata], target);

    InjectionContainer.getInstance().add(type, target.name, target);

    console.info(`Injectable ${type} ${target.name} registered`);
  };
}
