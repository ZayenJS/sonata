import 'reflect-metadata';
import yamlParser from 'js-yaml';

import app from './App';
import { config } from './Config/Config';
import { FS } from './Helpers/FS';
import { Logger } from './Helpers/Logger';
import { ConfigLoader } from './Loader/ConfigLoader';

export { BaseRepository } from './Repository/BaseRepository';
export * from './http/Request';
export * from './http/Response';
export * from './decorators';
export * from './controllers/AbstractController';
export * from './enums/http-status.enum';
export * from './enums/request-methods.enum';

global.logger = Logger.getInstance();

Object.defineProperty(global, '__ext', {
  get: () => {
    return __filename.split('.').pop();
  },
});

Object.defineProperty(global, '__dir', {
  get: () => {
    const delimiter = process.platform === 'win32' ? '\\' : '/';
    return __dirname.split(delimiter).pop();
  },
});

Object.defineProperty(global, '__root', {
  get: () => {
    const delimiter = process.platform === 'win32' ? '\\' : '/';
    return __dirname.split(delimiter).slice(0, -1).join(delimiter);
  },
});

Object.defineProperty(global, '__line', {
  get: () => {
    const err = new Error();
    const line = err.stack?.split('\n')[2].match(/(?::)(\d+)(?::)/)?.[1];
    return line ?? 'unknown';
  },
});

interface AppInitParams {
  config: string;
  views: string;
}

export default {
  // TODO: add support for changing config
  set(key: keyof AppInitParams, value: string) {
    if (key === 'config') {
    } else if (key === 'views') {
    }

    return this;
  },
  createApp() {
    const rootDir = FS.findApplicationDirectory();
    if (!rootDir) {
      throw new Error('Could not find package.json');
    }

    const configData = config.getData();

    const configLoader = new ConfigLoader();
    const fileContent = configLoader.load('template_engine');

    // TODO: implement without using external lib
    const yamlContent = yamlParser.load(fileContent);
    console.log({ yamlContent });

    // const servicesDirectory = FS.search(/[sS]ervices?/, rootDir, 'directory');
    // const controllersDirectory = FS.search(/[cC]ontrollers?/, rootDir, 'directory');
    // const entityDirectory = FS.search(/[eE]ntit[y|ies]|[mM]odels?/, rootDir, 'directory');
    // const repositoryDirectory = FS.search(/[rR]epositor[y|ies]?/, rootDir, 'directory');

    // try {
    //   if (controllersDirectory)
    //     Registerer.load(controllersDirectory, InjectionType.CONTROLLER);
    //   if (servicesDirectory) Registerer.load(servicesDirectory, InjectionType.SERVICE);
    //   if (entityDirectory) Registerer.load(entityDirectory, InjectionType.ENTITY);
    //   if (repositoryDirectory) Registerer.load(repositoryDirectory, InjectionType.REPOSITORY);
    // } catch (e) {
    //   console.error(e);
    //   process.exit(1);
    // }

    app.create();

    return app;
  },
};
