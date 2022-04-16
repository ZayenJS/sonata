import http from 'http';
import { GenericStringObject } from '../@types';
import { Route } from '../http/routing/Route';

export class RequestParser {
  public static async parseBody(req: http.IncomingMessage) {
    const parsedBody = await RequestParser._parseBody(req);
    const URLSearchParamsBody = new URLSearchParams(parsedBody);

    const body: GenericStringObject = {};

    URLSearchParamsBody.forEach((value, key) => {
      const trimedKey = key.trim();
      const trimedValue = value.trim();

      if (!trimedKey || !trimedValue) {
        return;
      }

      body[trimedKey] = trimedValue;
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

  private static parseQuery = (url: string) => {
    const parsedUrl = url.split('?')?.[1];

    const URLSearchParamsQuery = new URLSearchParams(parsedUrl);
    const query: GenericStringObject = {};

    URLSearchParamsQuery.forEach((value, key) => {
      query[key.trim()] = value.trim();
    });

    return query;
  };
  private static parseRouteParams(path: string, routePath: string) {
    const routeParams: GenericStringObject = {};
    const routeParamsKeys = routePath.split('/').filter(Boolean);
    const urlParamsKeys = path.split('/').filter(Boolean);

    routeParamsKeys.forEach((key, index) => {
      const trimedKey = key.trim();

      if (trimedKey.startsWith(':')) {
        routeParams[trimedKey.slice(1)] = urlParamsKeys[index];
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
