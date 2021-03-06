import { InjectableDependencyMetadata } from '../Injection/InjectionContainer';

export function extendMetadataArray<T extends Array<unknown>>(
  key: string,
  metadata: T,
  target: object,
): void;
export function extendMetadataArray<T extends Array<unknown>>(
  key: string,
  metadata: T,
  target: object,
  propertyKey: string | symbol,
): void;
export function extendMetadataArray<T extends Array<unknown>>(
  key: string,
  metadata: T,
  target: object,
  propertyKey?: string | symbol,
): void {
  if (!propertyKey) {
    const previousValue = Reflect.getMetadata(key, target) || [];
    const value = [...previousValue, ...metadata];

    Reflect.defineMetadata(key, value, target);
    return;
  }

  const previousValue = Reflect.getMetadata(key, target, propertyKey) || [];
  const value = [...previousValue, ...metadata];

  Reflect.defineMetadata(key, value, target, propertyKey);
}

export const isNumberish = (value: unknown): value is number =>
  typeof value === 'number' ||
  value instanceof Number ||
  (typeof value === 'string' && !isNaN(+value)) ||
  (value instanceof String && !isNaN(+value));

export const isClass = (fn: Function) =>
  !['Number', 'String', 'Boolean', 'Set', 'Map', 'Array', 'Object', 'Function'].includes(
    fn.name,
  );

export const getClassDependencies = (target: Function): InjectableDependencyMetadata[] => {
  const constructorParamTypes = (Reflect.getMetadata('design:paramtypes', target) ||
    []) as Function[];

  return constructorParamTypes
    .map((paramType, index) => (isClass(paramType) ? { class: paramType, index } : null))
    .filter(x => x) as InjectableDependencyMetadata[];
};

export const isRedirectStatus = (status: number): boolean =>
  status === 301 || status === 302 || status === 303 || status === 307;
