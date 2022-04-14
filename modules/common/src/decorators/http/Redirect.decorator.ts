import { REDIRECT_METADATA } from '../../constants';
import { HttpStatus } from '../../enums/http-status.enum';

/**
 * Redirects request to the specified URL.
 *
 * @publicApi
 */
export function Redirect(url = '', statusCode: HttpStatus = HttpStatus.OK): MethodDecorator {
  return (target: object, key: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    Reflect.defineMetadata(REDIRECT_METADATA, { statusCode, url }, target, key);
    return descriptor;
  };
}
