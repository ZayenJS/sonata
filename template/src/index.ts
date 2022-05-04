import App, { HttpStatus } from '@sonata/common';

App.createApp()
  // .notFound((_, res) => {
  //   res.status(HttpStatus.NOT_FOUND).send('Page not foud !');
  // })
  // .serverError((_, res, err) => {
  //   res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(`Server had a problem: ${err}`);
  // })
  .listen();
