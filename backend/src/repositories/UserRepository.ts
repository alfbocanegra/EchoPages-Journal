import { Repository, FindOptionsWhere, DataSource } from 'typeorm';
import { User, AuthProvider } from '@echopages/shared';

export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findByOAuth(provider: AuthProvider, oauthId: string): Promise<User | null> {
    return await this.findOne({
      where: {
        authProvider: provider,
        authProviderId: oauthId,
      } as FindOptionsWhere<User>,
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ where: { username } });
  }
}
