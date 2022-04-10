import http from 'http';

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

  public static parseQuery = (query?: string): URLSearchParams =>
    query ? new URLSearchParams(query) : new URLSearchParams();
}
