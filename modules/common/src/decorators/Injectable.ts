import App from '../App';

export function Injectable(type: string) {
  return (target: object) => {
    const exisitingMetadata = Reflect.getOwnMetadata('__INJECTABLE__', target);

    const metadata = {
      type,
    };

    Reflect.defineMetadata(
      '__INJECTABLE__',
      [...(exisitingMetadata ?? []), metadata],
      target,
    );

    App.addInjectable(type, target);
  };
}
