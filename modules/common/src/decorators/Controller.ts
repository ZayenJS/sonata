import { InjectionType } from '../enums/InjectionType';
import { InjectionContainer } from '../Injection/InjectionContainer';

export const Controller = (constructor: Function) => {
  // TODO: logging here to see if the controller was registered
  console.log(`Controller ${constructor.name} registered`);

  InjectionContainer.getInstance().add(
    InjectionType.CONTROLLER,
    constructor.name,
    constructor,
  );
};
