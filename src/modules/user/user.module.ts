import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserFavoriteSport } from '../sport/entities/user-favorite-sport.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserFavoriteSport])],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
