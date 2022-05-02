export interface ConfigInterface {
  port: number;
  views_folder: string;
  views_extension: string;
  public_folder: string;
}

export class Config {
  private static _instance: Config;
  private _config: ConfigInterface = {
    port: 5000,
    views_folder: '',
    views_extension: 'sonata',
    public_folder: '',
  };

  private constructor() {}

  public get(key: keyof ConfigInterface): string | number {
    return this._config[key];
  }

  public set(key: keyof ConfigInterface, value: string | number): this {
    this._config = {
      ...this._config,
      [key]: value,
    };

    return this;
  }

  public has(key: string): boolean {
    return key in this._config;
  }

  public delete(key: keyof ConfigInterface): this {
    delete this._config[key];

    return this;
  }

  public getData(): ConfigInterface {
    return { ...this._config };
  }

  public static getInstance(): Config {
    if (!Config._instance) {
      Config._instance = new Config();
    }

    return Config._instance;
  }
}

export const config = Config.getInstance();
