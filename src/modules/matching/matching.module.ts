// src/matching/matching.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchingService } from './matching.service';
import { MatchingResolver } from './matching.resolver';
import { Swipe } from './enitities/swipe.entity';
import { Friendship } from '../friendship/entities/friendship.entity';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    // bây giờ ta cần cả User repository nữa
    TypeOrmModule.forFeature([Swipe, Friendship, User]),
    UserModule,
  ],
  providers: [MatchingService, MatchingResolver],
})
export class MatchingModule {}
