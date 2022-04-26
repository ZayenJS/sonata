import {
  AbstractController,
  Body,
  Controller,
  Header,
  HttpCode,
  HttpResponse,
  HttpStatus,
  Param,
  Query,
  Render,
  RequestMethod,
  Route,
} from '@sonata/common';
import { GenericStringObject } from '@sonata/common/dist/@types';
import path from 'path';
import { User } from '../Entity/User';
import { UserRepository } from '../Repository/UserRepository';
import { I18N } from '../Services/I18N';

@Controller()
export default class MainController extends AbstractController {
  @HttpCode(HttpStatus.OK)
  @Render('index.html')
  @Route('/', { methods: [RequestMethod.GET] })
  public index(): void {
    if (!this.request.session.user) {
      return this.response.redirect('/login');
    }

    // do something...
  }

  @Header('Content-Type', 'text/html') // if not set, default would be text/html anyway
  @Route('/greet', { methods: [RequestMethod.GET] })
  public greet(@Query('firstName') firstName: string, @Query('lastName') lastName: string) {
    return `Hello ${firstName} ${lastName} !`;
  }

  @Route('/login', { methods: [RequestMethod.GET] })
  public login(): void {
    this.response.sendFile(path.join(__dirname, '..', '..', 'views', 'auth', 'login.html'));
  }

  @Route('/login', { methods: [RequestMethod.POST] })
  public async loginPost(@Body() body: GenericStringObject, userRepo: UserRepository) {
    const { email, password } = body;

    const user = await userRepo.findOne(email);

    if (!user) {
      return this.response.status(HttpStatus.UNAUTHORIZED).render('auth/login.html', {
        error: 'User not found.',
        email,
      });
    }

    if (user.password !== password) {
      return this.response.status(HttpStatus.UNAUTHORIZED).render('auth/login.html', {
        error: 'Wrong password.',
        email,
      });
    }

    this.request.session.user = user;
    this.response.redirect('/connected');
  }

  @Route('/connected', { methods: [RequestMethod.GET] })
  public connected() {
    if (!this.request.session.user) {
      return this.response.redirect('/login');
    }

    console.log(this.request.session);

    // @ts-ignore
    return this.response.render('connected', {
      user: this.request.session.user,
    });
  }

  @Route('/translate/:word', { methods: [RequestMethod.GET] })
  public translate(@Param('word') word: string, i18n: I18N): HttpResponse {
    return this.json({
      word,
      translation: i18n.translate(word),
    });
  }
}
