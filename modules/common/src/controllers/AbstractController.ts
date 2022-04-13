import { HttpStatus } from '../enums/http-status.enum';
import { HttpResponse } from '../http/Response';

export abstract class AbstractController {
  protected json(data: any, status: number = HttpStatus.OK): HttpResponse {
    if (typeof data !== 'object') {
      throw new Error('Data must be an object');
    }

    return {
      body: JSON.stringify(data),
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
}
