import http from 'http';
import { Route } from '../http/routing/Route';

export class RequestParser {
  public static async parseBody(req: http.IncomingMessage) {
    const parsedBody = await RequestParser._parseBody(req);
    const body = new URLSearchParams(parsedBody);
    body.forEach((_, key) => {
      if (!key) {
        body.delete(key);
      }
    });

    return body;
  }

  private static async _parseBody(req: http.IncomingMessage): Promise<string> {
    return new Promise(resolve => {
      let body = '';

      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        resolve(body);
      });
    });
  }

  private static parseQuery = (url: string): URLSearchParams => {
    const parsedUrl = url.split('?')?.[1];

    return parsedUrl ? new URLSearchParams(parsedUrl) : new URLSearchParams();
  };
  private static parseRouteParams(path: string, routePath: string): URLSearchParams {
    const routeParams = new URLSearchParams();
    const routeParamsKeys = routePath.split('/').filter(Boolean);
    const urlParamsKeys = path.split('/').filter(Boolean);

    routeParamsKeys.forEach((key, index) => {
      if (key.startsWith(':')) {
        routeParams.append(key.slice(1), urlParamsKeys[index]);
      }
    });

    return routeParams;
  }

  public static parseURL(url: string, route: Route) {
    const queryParams = RequestParser.parseQuery(url);

    const urlWithoutQuery = url.split('?')?.[0];
    const routeParams = RequestParser.parseRouteParams(urlWithoutQuery, route.getPath());

    return {
      queryParams,
      routeParams,
    };
  }
}
