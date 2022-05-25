import path from 'path';
import 'reflect-metadata';
import yamlParser from 'yaml';
import { DeptInjectionConfigInterface, TemplateEngineConfigInterface } from './@types';

import app from './App';
import { config } from './Config/Config';
import { InjectionType } from './enums/InjectionType';
import { FS } from './Helpers/FS';
import { Logger } from './Helpers/Logger';
import { ConfigLoader } from './Loader/ConfigLoader';
import { EnvLoader } from './Loader/EnvLoader';
import { Registerer } from './Services/Registerer';

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

    const envFileLoader = new EnvLoader();
    const envVariables = envFileLoader.loadEnvFile();

    // TODO: do something with envVariables

    const configLoader = new ConfigLoader();
    const templateEngineConfigFileContent = configLoader.load('template_engine');

    const templateEngineConfig = yamlParser.parse(
      templateEngineConfigFileContent,
    ) as TemplateEngineConfigInterface;

    const deptInjectionConfigFileContent = configLoader.load('dept_injection');

    config.set('views_folder', path.join(rootDir, templateEngineConfig.views.folder));
    config.set('views_extension', templateEngineConfig.views.extension);
    config.set('public_folder', path.join(rootDir, 'public'));
    config.set('port', 5000);

    const deptInjectionConfig = yamlParser.parse(
      deptInjectionConfigFileContent,
    ) as DeptInjectionConfigInterface;

    const servicesDirectory = path.join(rootDir, deptInjectionConfig.injectables.services);
    const controllersDirectory = path.join(
      rootDir,
      deptInjectionConfig.injectables.controllers,
    );
    const entitiesDirectory = path.join(rootDir, deptInjectionConfig.injectables.entities);
    const repositoriesDirectory = path.join(
      rootDir,
      deptInjectionConfig.injectables.repositories,
    );

    Registerer.registerServices(servicesDirectory);
    Registerer.registerControllers(controllersDirectory);
    Registerer.registerEntities(entitiesDirectory);
    Registerer.registerRepositories(repositoriesDirectory);

    app.create();

    return app;
  },
};
