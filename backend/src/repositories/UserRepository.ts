import { Repository, EntityRepository, FindOptionsWhere } from 'typeorm';
import { User } from '@echopages/shared/entities';
import { AuthProvider } from '@echopages/shared/types';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findByOAuth(provider: AuthProvider, oauthId: string): Promise<User | null> {
    return await this.findOne({
      where: {
        oauthProvider: provider,
        oauthId
      } as FindOptionsWhere<User>
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ where: { username } });
  }
} 