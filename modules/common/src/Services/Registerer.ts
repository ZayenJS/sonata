import fs from 'fs';
import path from 'path';

import { InjectionType } from '../enums/InjectionType';
import { InjectionContainer } from '../Injection/InjectionContainer';

export class Registerer {
  public static registerInjectable(
    injectionType: InjectionType,
    name: string,
    constructor: Function,
  ): void {
    InjectionContainer.getInstance().add(injectionType, name, constructor);
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
