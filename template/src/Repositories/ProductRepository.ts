import { Injectable, BaseRepository } from '@sonata/common';
import { InjectionType } from '@sonata/common/dist/enums/InjectionType';
import { Product } from '../Entities/Product';

const products: Product[] = [];

@Injectable(InjectionType.REPOSITORY)
export class ProductRepository extends BaseRepository<Product> {
  public async findOne(id: number): Promise<Product | undefined> {
    return new Promise(resolve => {
      setTimeout(() => {
        const product = products.find(product => product.id === id);

        resolve(product);
      }, 1500);
    });
  }

  public async findAll(): Promise<Product[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(products);
      }, 1500);
    });
  }

  public async create(product: Product): Promise<Product> {
    return new Promise(resolve => {
      setTimeout(() => {
        product.id = products.length + 1;
        products.push(product);
        resolve(product);
      }, 1000);
    });
  }

  public async update(id: number, product: Partial<Product>): Promise<Product> {
    return new Promise(resolve => {
      setTimeout(() => {
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
          products[index] = Object.assign(products[index], product);
          resolve(products[index]);
        }
      }, 750);
    });
  }

  public async delete(id: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        const index = products.findIndex(p => p.id === id);
        products.splice(index, 1);
        resolve();
      }, 500);
    });
  }

  public async findByCategory(category: string): Promise<Product[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(products.filter(p => p.category === category));
      }, 1500);
    });
  }
}
