import { HEADERS_METADATA } from '../../constants';
import { extendMetadataArray } from '../../utils';

/**
 * Request method Decorator.  Sets a response header.
 *
 * For example:
 * `@Header('Content-Type', 'application/json')`
 *
 * @param name The header name to set.
 * @param value The value to use for the header.
 *
 *
 * @publicApi
 */
export function Header(name: string, value: string): MethodDecorator {
  return (
    target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    extendMetadataArray(HEADERS_METADATA, [{ name, value }], target, key);

    return descriptor;
  };
}
