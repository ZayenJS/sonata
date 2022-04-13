import fs from 'fs';
import path from 'path';
import { INJECTABLE } from '../constants';

import { InjectionType } from '../enums/InjectionType';
import {
  Constructor,
  InjectableMetadata,
  InjectionContainer,
} from '../Injection/InjectionContainer';
import { extendMetadataArray, getClassDependencies } from '../utils';

export class Registerer {
  public static registerInjectable(
    injectionType: InjectionType,
    name: string,
    constructor: Constructor,
  ): void {
    const deps = getClassDependencies(constructor);

    const metadata: InjectableMetadata = {
      type: injectionType,
      name: constructor.name,
      deps,
      target: constructor,
    };

    extendMetadataArray(INJECTABLE, [metadata], constructor);

    InjectionContainer.getInstance().add({
      type: injectionType,
      name,
      target: constructor,
      deps: Reflect.getMetadata('design:paramtypes', constructor) || [],
    });
  }

  public static load(directory: string, type: InjectionType): Registerer {
    fs.readdir(directory, (err, files) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      for (const file of files) {
        let defaultExportedClass = require(path.join(directory, file));
        defaultExportedClass = Object.values(defaultExportedClass).shift();

        Registerer.registerInjectable(
          type,
          defaultExportedClass.name,
          defaultExportedClass,
        );
      }
    });

    return Registerer;
  }
}
