import {
  AbstractController,
  Body,
  Controller,
  Header,
  HttpCode,
  HttpResponse,
  HttpStatus,
  Param,
  RequestMethod,
  Route,
} from '@sonata/common';
import { Product } from '../Entity/Product';
import { ProductRepository } from '../Repository/ProductRepository';

interface CreateProductInterface {
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

@Controller('home')
export default class ProductController extends AbstractController {
  @HttpCode(HttpStatus.OK)
  @Route('/product', { methods: [RequestMethod.GET] })
  public async list(productRepository: ProductRepository): Promise<HttpResponse> {
    const products = await productRepository.findAll();

    return this.json(products);
  }

  @HttpCode(HttpStatus.OK)
  @Route('/product/:id', { methods: [RequestMethod.GET] })
  public async show(
    @Param('id') id: number,
    productRepository: ProductRepository,
  ): Promise<HttpResponse> {
    const product = await productRepository.findOne(id);

    return this.json(product);
  }

  @HttpCode(HttpStatus.CREATED)
  @Route('/product', { methods: [RequestMethod.POST] })
  public async create(@Body() productData: CreateProductInterface) {
    const product = new Product();
    const createdProduct = await product
      .setName(productData.name)
      .setPrice(productData.price)
      .setDescription(productData.description)
      .setImage(productData.image)
      .setCategory(productData.category)
      .save();

    return this.json(createdProduct);
  }

  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/json')
  @Route('/product/:id', { methods: [RequestMethod.PUT] })
  public async update(
    @Param('id') id: number,
    productRepository: ProductRepository,
    @Body() productData: Partial<Product>,
  ): Promise<string> {
    return (await productRepository.update(id, productData)).toJson();
  }

  @Route('/product/:id', { methods: [RequestMethod.DELETE] })
  @HttpCode(HttpStatus.OK)
  public async delete(
    @Param('id') id: number,
    productRepository: ProductRepository,
  ): Promise<HttpResponse> {
    await productRepository.delete(id);

    return this.json({ message: 'Product deleted' });
  }
}
