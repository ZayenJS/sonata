export interface GenericObject {
  [key: string]: any;
}

export interface GenericStringObject {
  [key: string]: string;
}

export interface TemplateEngineConfigInterface {
  views: {
    folder: string;
    extension: string;
  };
}

export interface DeptInjectionConfigInterface {
  injectables: {
    services: string;
    controllers: string;
    entities: string;
    repositories: string;
  };
}
