import 'reflect-metadata';

import app, { App } from './App';
import { InjectionType } from './enums/InjectionType';
import { FS } from './Helpers/FS';
import { Registerer } from './Services/Registerer';

export * from './http/Request';
export * from './http/Response';
export * from './decorators';
export * from './controllers/AbstractController';
export * from './enums/http-status.enum';
export * from './enums/request-methods.enum';

export default {
  createApp() {
    app.create();

    const rootDir = FS.findRootDirectory();
    if (!rootDir) {
      throw new Error('Could not find package.json');
    }

    const controllersDirectory = FS.search(/[cC]ontrollers?/, rootDir, 'directory');

    const servicesDirectory = FS.search(/[sS]ervices?/, rootDir, 'directory');

    const entityDirectory = FS.search(
      /[eE]ntit[y|ies]|[mM]odels?/,
      rootDir,
      'directory',
    );

    try {
      console.log({
        controllersDirectory,
        servicesDirectory,
        entityDirectory,
      });

      if (controllersDirectory)
        Registerer.load(controllersDirectory, InjectionType.CONTROLLER);
      if (servicesDirectory)
        Registerer.load(servicesDirectory, InjectionType.SERVICE);
      if (entityDirectory) Registerer.load(entityDirectory, InjectionType.ENTITY);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }

    return app;
  },
};
