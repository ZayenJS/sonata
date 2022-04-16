import http, { Server as NodeServer } from 'http';
import path from 'path';
import { REDIRECT_METADATA, RENDER_METADATA } from './constants';

import app from './App';

import { HttpStatus } from './enums/http-status.enum';
import { RequestParser } from './Helpers/RequestParser';

import { Request } from './http/Request';
import { Response } from './http/Response';
import { Router } from './http/routing/Router';
import { InjectionContainer } from './Injection/InjectionContainer';
import { Logger } from './Helpers/Logger';
import { Session } from './http/Session';
import { isRedirectStatus } from './utils';

export class Server {
  private static _created = false;
  private _nodeServer: http.Server = new NodeServer();

  private _notFoundCallback?: (request: Request, response: Response) => void;

  public set notFoundCallback(callback: (request: Request, response: Response) => void) {
    this._notFoundCallback = callback;
  }

  private _catchAllCallback?: (request: Request, response: Response, message?: string) => void;

  public set catchAllCallback(
    callback: (request: Request, response: Response, message?: string) => void,
  ) {
    this._catchAllCallback = callback;
  }

  private _serverErrorCallback?: (request: Request, response: Response, error: string) => void;

  public set serverErrorCallback(
    callback: (request: Request, response: Response, error: string) => void,
  ) {
    this._serverErrorCallback = callback;
  }

  public get router() {
    return this._router;
  }

  public constructor(private readonly _router: Router) {}

  public registerMiddlewares() {}

  public create() {
    if (Server._created) {
      throw new Error(
        'App has already been created and cannot be created again. Use App.getInstance() to get the instance of the App instead.',
      );
    }

    this._nodeServer = http.createServer(async (req, res) => {
      const request = new Request(req) as Request;
      const response = new Response(res) as Response;

      const sessionName = request.session.name;
      const cookies = request.cookies;
      const sessionCookie = cookies.find(cookie => cookie.name === sessionName);
      const userSession = Session.sessions.get(`${sessionCookie?.value}`);

      if (!sessionCookie) {
        response.setCookie(sessionName, request.session.id);
        request.session.save();
      } else if (!userSession) {
        request.session.id = sessionCookie.value;
        Session.sessions.set(sessionCookie.value, request.session);
      } else {
        request.session = userSession;
      }

      try {
        let incompleteRequest = false;

        if (!req.url) incompleteRequest = true;
        if (!req.method) incompleteRequest = true;
        // throw new Error('test');
        if (incompleteRequest) {
          return response.status(HttpStatus.BAD_REQUEST).send('Incomplete request');
        }
      } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'Internal Server Error';

        if (this._catchAllCallback)
          return this._catchAllCallback(request, response, errorMessage);

        if (this._serverErrorCallback) {
          return this._serverErrorCallback(request, response, errorMessage);
        }

        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error');
      }

      try {
        this.router.request = request;

        const matchingRoute = this.router.getMatchingRoute();

        if (!this.router.routesLength || !matchingRoute) {
          if (this._catchAllCallback) return this._catchAllCallback(request, response);
          if (this._notFoundCallback) return this._notFoundCallback(request, response);

          res.writeHead(404);
          return res.end('404');
        }

        const { queryParams, routeParams } = matchingRoute.extractParams(request.url);

        request.query = queryParams;
        request.params = routeParams;
        request.body = await RequestParser.parseBody(req);

        this.registerMiddlewares();

        const routeHandler = matchingRoute.getHandler();
        const routeName = matchingRoute.getName();
        const controller = matchingRoute.getController();
        controller.request = request;
        controller.response = response;

        const args: unknown[] = [...Object.values(request.params)];

        const injectionContainer = InjectionContainer.getInstance();

        injectionContainer
          .set('toBeInjectedArgs', args)
          .injectQueryParams(request, controller, routeName)
          .injectBodyParams(request, controller, routeName)
          .injectRouteParams(request, controller, routeName)
          .injectDependencies(request, response, controller, routeName);

        const injectableArgs = injectionContainer.getInjectableArgs();

        let endResponse = await routeHandler(...injectableArgs);

        const headersMetadata = injectionContainer.getHeadersMetadata(
          request,
          controller,
          routeName,
        );

        const headers = { ...response.headers, ...headersMetadata };

        const redirectMetadata = Reflect.getMetadata(REDIRECT_METADATA, controller, routeName);
        const renderMetadata = Reflect.getMetadata(RENDER_METADATA, controller, routeName);
        const statusCode = injectionContainer.getStatusCodeMetadata(controller, routeName);

        response.status(statusCode).setHeaders(headers);

        if (renderMetadata) {
          const templateName = renderMetadata;
          const templatePath = path.join(app.config.views, templateName);

          return response.sendFile(templatePath);
        }

        if (redirectMetadata) {
          return response.redirect(redirectMetadata.url, redirectMetadata.statusCode);
        }

        if (endResponse instanceof Object && !endResponse.headers) {
          endResponse = JSON.stringify(endResponse);

          response.setHeader('Content-Type', 'application/json');
        } else if (endResponse instanceof Object && endResponse.headers) {
          response.setHeaders(endResponse.headers);

          endResponse = endResponse.body;
        }

        return response.send(endResponse);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Internal Server Error';

        if (this._catchAllCallback)
          return this._catchAllCallback(request, response, errorMessage);

        if (this._serverErrorCallback) {
          return this._serverErrorCallback(request, response, errorMessage);
        }

        return response.status(500).send('Internal Server Error');
      }
    });
  }

  public catchAll(callback: (request: Request, response: Response, message?: string) => void) {
    this._catchAllCallback = callback;

    return this;
  }

  public notFound(callback: (request: Request, response: Response) => void) {
    this._notFoundCallback = callback;

    return this;
  }

  public serverError(callback: (request: Request, response: Response, error: string) => void) {
    this._serverErrorCallback = callback;

    return this;
  }

  public get nodeServer() {
    return this._nodeServer;
  }

  public listen(): this;
  public listen(port: number): this;
  public listen(port: number, callback: () => void): this;
  public listen(port: number = 5000, callback?: () => void) {
    this._nodeServer.listen(port, () => {
      // TODO: logging stuff...
      console.info(`Server is listening on port ${port}`);

      callback?.();
    });

    return this;
  }
}
