import { Injectable } from '@sonata/common';
import { InjectionType } from '@sonata/common/dist/enums/InjectionType';
import { Translator } from './Translator';

@Injectable(InjectionType.SERVICE)
export class I18N {
  public constructor(private readonly translatorService: Translator) {}
  public translate(key: string): string {
    //do something...

    return this.translatorService.translate(key);
  }
}
