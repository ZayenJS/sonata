import App from '../App';

export const Controller = (constructor: Function) => {
  // TODO: logging here to see if the controller was registered
  console.log(`Controller ${constructor.name} registered`);

  App.addController(constructor);
};
