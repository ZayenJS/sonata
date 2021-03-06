import { HTTP_STATUS_CODE_METADATA } from '../../constants';
import { HttpStatus } from '../../enums/http-status.enum';

/**
 * Request method Decorator. Defines the HTTP response status code.
 *
 * @param statusCode HTTP response code to be returned by route handler.
 *
 * @publicApi
 */
export function HttpCode(statusCode: HttpStatus): MethodDecorator {
  return (
    target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    Reflect.defineMetadata(HTTP_STATUS_CODE_METADATA, statusCode, target, key);

    return descriptor;
  };
}
