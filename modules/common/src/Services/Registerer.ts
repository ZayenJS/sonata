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
    // replaces src with dist to read js file and not ts file
    const dir = directory.replace(/\bsrc\b/g, 'dist');

    fs.readdir(dir, (err, files) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      for (const file of files) {
        import(path.join(dir, file)).then(module => {
          // reads ts or js file
          const className = file.replace(/\.ts|\.js/g, '');
          const tsClass = module[className];

          if (!tsClass) {
            // TODO: better logging
            logger.error(
              `class ${className} not found in ${directory}. Dependency not registered.`,
            );
            return;
          }

          Registerer.registerInjectable(type, tsClass.name, tsClass);
        });
      }
    });

    return Registerer;
  }

  public static registerServices(directory: string): Registerer {
    Registerer.load(directory, InjectionType.SERVICE);

    return Registerer;
  }

  public static registerControllers(directory: string): Registerer {
    Registerer.load(directory, InjectionType.CONTROLLER);

    return Registerer;
  }

  public static registerEntities(directory: string): Registerer {
    Registerer.load(directory, InjectionType.ENTITY);

    return Registerer;
  }

  public static registerRepositories(directory: string): Registerer {
    Registerer.load(directory, InjectionType.REPOSITORY);

    return Registerer;
  }
}
