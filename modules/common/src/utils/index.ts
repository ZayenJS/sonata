export function extendMetadataArray<T extends Array<unknown>>(
  key: string,
  metadata: T,
  target: Function,
): void;
export function extendMetadataArray<T extends Array<unknown>>(
  key: string,
  metadata: T,
  target: Function,
  propertyKey: string | symbol,
): void;
export function extendMetadataArray<T extends Array<unknown>>(
  key: string,
  metadata: T,
  target: Function,
  propertyKey?: string | symbol,
): void {
  if (!propertyKey) {
    const previousValue = Reflect.getMetadata(key, target) || [];
    const value = [...previousValue, ...metadata];
    console.log('extendMetadataArray: ', key, value);
    Reflect.defineMetadata(key, value, target);
    return;
  }

  const previousValue = Reflect.getMetadata(key, target, propertyKey) || [];
  const value = [...previousValue, ...metadata];
  console.log('extendMetadataArray: ', key, value, propertyKey);
  Reflect.defineMetadata(key, value, target, propertyKey);
}
