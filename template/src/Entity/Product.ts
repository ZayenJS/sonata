import { Injectable } from '@sonata/common';
import { InjectionType } from '@sonata/common/dist/enums/InjectionType';
import { ProductRepository } from '../Repository/ProductRepository';

@Injectable(InjectionType.ENTITY)
export class Product {
  public id!: number;
  public name!: string;
  public price!: number;
  public description: string = '';
  public image: string = '';
  public category: string = '';
  public createdAt: Date = new Date();
  public updatedAt?: Date;

  constructor(params?: Partial<Product>) {
    Object.assign(this, params);
  }

  public toJson(): string {
    return JSON.stringify({
      id: this.id,
      name: this.name,
      price: this.price,
      description: this.description,
      image: this.image,
      category: this.category,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  public setId(id: number) {
    this.id = id;
    return this;
  }

  public setName(name: string) {
    this.name = name;
    return this;
  }

  public setPrice(price: number) {
    this.price = price;
    return this;
  }

  public setDescription(description: string) {
    this.description = description;
    return this;
  }

  public setImage(image: string) {
    this.image = image;

    return this;
  }

  public setCategory(category: string) {
    this.category = category;

    return this;
  }

  public setCreatedAt(createdAt: Date) {
    this.createdAt = createdAt;

    return this;
  }

  public setUpdatedAt(updatedAt: Date) {
    this.updatedAt = updatedAt;

    return this;
  }

  public save(): Promise<Product> {
    return new Promise(resolve => {
      setTimeout(async () => {
        const product = await new ProductRepository().create(this);
        resolve(product);
      }, 1000);
    });
  }
}
