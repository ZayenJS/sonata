export abstract class BaseRepository<T> {
  public abstract findOne(id: unknown): Promise<T | undefined>;
  public abstract findAll(): Promise<T[]>;
  public abstract create(params: unknown): Promise<T>;
  public abstract update(id: unknown, params: unknown): Promise<T | undefined>;
  public abstract delete(id: unknown): Promise<void>;
}
