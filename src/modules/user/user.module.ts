import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFavoriteSport } from '../sport/entities/user-favorite-sport.entity';
import { User } from './entities/user.entity';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserFavoriteSport])],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
