import { Injectable } from '@sonata/common';
import { InjectionType } from '@sonata/common/dist/enums/InjectionType';

@Injectable(InjectionType.ENTITY)
export class User {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public password!: string;
  public createdAt: Date = new Date();
  public updatedAt?: Date;

  constructor(params?: Partial<User>) {
    Object.assign(this, params);
  }

  public toJSON(): any {
    return JSON.stringify({
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  public setFirstName(firstName: string) {
    this.firstName = firstName;
    return this;
  }

  public setLastName(lastName: string) {
    this.lastName = lastName;
    return this;
  }

  public setEmail(email: string) {
    this.email = email;
    return this;
  }

  public setPassword(password: string) {
    this.password = password;
    return this;
  }

  public setId(id: number) {
    this.id = id;
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
}
