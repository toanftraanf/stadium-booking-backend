import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequest } from './entities/friend-request.entity';
import { Friendship } from './entities/friendship.entity';
import { FriendshipService } from './friendship.service';
import { FriendshipResolver } from './friendship.resolver';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendRequest, Friendship]),
    UserModule, // để lấy Repository<User>
  ],
  providers: [FriendshipService, FriendshipResolver],
  exports: [FriendshipService],
})
export class FriendshipModule {}
