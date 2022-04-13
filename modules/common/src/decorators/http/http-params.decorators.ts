import {
  QUERY_PARAM_METADATA,
  BODY_PARAM_METADATA,
  ROUTE_PARAM_METADATA,
  DEPT_INJECTION_METADATA,
} from '../../constants';
import { extendMetadataArray } from '../../utils';

/**
 * Route handler parameter decorator. Extracts the query
 * parameters from the url and populates the decorated
 * parameter with the extracted value.
 *
 * For example:
 * ```typescript
 * async find(@Query('token') token: string)
 * ```
 *
 * @param name name of a single property to extract from the query parameters
 *
 * @publicApi
 */
export function Query(name: string): ParameterDecorator;
export function Query(): ParameterDecorator;
export function Query(name?: string): ParameterDecorator {
  return (target: any, propertyKey: string | symbol, parameterIndex: number) => {
    const metadata = {
      name: name ?? null,
      parameterIndex,
    };

    extendMetadataArray(QUERY_PARAM_METADATA, [metadata], target, propertyKey);
  };
}

/**
 * Route handler parameter decorator. Extracts the request body
 * and populates the decorated parameter with the extracted value.
 *
 * For example:
 * ```typescript
 * async create(@Body() body: RequestBody)
 * ```
 *
 * @param name name of a single property to extract from the request body
 *
 * @publicApi
 */
export function Body(name: string): ParameterDecorator;
export function Body(): ParameterDecorator;
export function Body(name?: string): ParameterDecorator {
  return (target: any, propertyKey: string | symbol, parameterIndex: number) => {
    const metadata = {
      name: name ?? null,
      parameterIndex,
    };

    extendMetadataArray(BODY_PARAM_METADATA, [metadata], target, propertyKey);
  };
}

/**
 * Route handler parameter decorator. Extracts the params from the route path
 * and populates the decorated parameter with the extracted values.
 *
 * For example, extracting all params:
 * ```typescript
 * findOne(@Param() params: {[key: string]: string})
 * ```
 *
 * For example, extracting a single param:
 * ```typescript
 * findOne(@Param('id') id: string)
 * ```
 * @param property name of single property to extract from the route path
 *
 * @publicApi
 */
export function Param(): ParameterDecorator;
export function Param(property: string): ParameterDecorator;
export function Param(property?: string): ParameterDecorator {
  return (target: any, propertyKey: string | symbol, parameterIndex: number) => {
    const metadata = {
      property,
      parameterIndex,
    };

    extendMetadataArray(ROUTE_PARAM_METADATA, [metadata], target, propertyKey);
  };
}

export function Inject(): ParameterDecorator {
  return (target: any, propertyKey: string | symbol, parameterIndex: number) => {
    const metadata = {
      class: target,
      parameterIndex,
    };

    extendMetadataArray(DEPT_INJECTION_METADATA, [metadata], target, propertyKey);
  };
}
