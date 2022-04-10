import 'reflect-metadata';

import app, { App } from './App';
import { FS } from './Helpers/FS';

export * from './http/Request';
export * from './http/Response';
export * from './decorators';
export * from './controllers/AbstractController';
export * from './enums/http-status.enum';
export * from './enums/request-methods.enum';

export default {
  createApp() {
    app.create();

    const rootDir = FS.findRootDirectory(process.cwd());
    if (!rootDir) {
      throw new Error('Could not find package.json');
    }

    const controllersDirectory = FS.search('controllers', rootDir, {
      direction: 'downward',
      type: 'directory',
    });

    if (!controllersDirectory) {
      throw new Error('Could not find controllers directory');
    }

    try {
      app.setControllersDirectory(controllersDirectory).registerControllers();
    } catch (e) {
      console.error(e);
      process.exit(1);
    }

    return app;
  },
};
