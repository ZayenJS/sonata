import { BaseRepository, Injectable } from '@sonata/common';
import { InjectionType } from '@sonata/common/dist/enums/InjectionType';
import { User } from '../Entities/User';

// dummy data
const users: User[] = [
  new User({
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'johndoe@test.com',
    password: '123456',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  new User({
    id: 2,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'janedoe@test.com',
    password: '123456',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
];

@Injectable(InjectionType.ENTITY)
export class UserRepository extends BaseRepository<User> {
  public async findAll(): Promise<User[]> {
    return new Promise(resolve => setTimeout(() => resolve(users), 1000));
  }

  public async findOne(email: string): Promise<User | undefined> {
    return new Promise(resolve =>
      setTimeout(() => resolve(users.find(user => user.email === email)), 1000),
    );
  }

  public async create(params: User): Promise<User> {
    return new Promise(resolve =>
      setTimeout(() => {
        const user = new User({ ...params, id: users.length + 1 });
        users.push(user);
        resolve(user);
      }, 1000),
    );
  }

  public async update(id: number, params: Partial<User>): Promise<User> {
    const user = users.find(user => user.id === id);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = new User({ ...user, ...params });
    users.splice(users.indexOf(user), 1, updatedUser);

    return new Promise(resolve => setTimeout(() => resolve(updatedUser), 1000));
  }

  public async delete(id: number): Promise<void> {
    const user = users.find(user => user.id === id);
    if (!user) {
      throw new Error('User not found');
    }

    users.splice(users.indexOf(user), 1);

    return new Promise(resolve => setTimeout(() => resolve(), 1000));
  }
}
