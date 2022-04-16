import { HttpStatus } from '../enums/http-status.enum';
import { Logger } from '../Helpers/Logger';
import { Request } from '../http/Request';
import { HttpResponse, Response } from '../http/Response';

export abstract class AbstractController {
  constructor(protected readonly request: Request, protected readonly response: Response) {}

  protected json(data: any, status: number = HttpStatus.OK): HttpResponse {
    Logger.getInstance().custom(
      'AbstractController',
      __line,
      `Sending json with status ${status}, data: ${JSON.stringify(data)}`,
    );

    if (!data) throw new Error('No data provided');

    if (typeof data !== 'object') {
      throw new Error('Data must be an object');
    }

    return {
      body: JSON.stringify(data),
      status,
      headers: {
        ...this.response.headers,
        'Content-Type': 'application/json',
      },
    };
  }
}
