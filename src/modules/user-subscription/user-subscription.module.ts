import { Module } from '@nestjs/common';
import { UserSubscriptionService } from './user-subscription.service';
import { UserSubscriptionResolver } from './user-subscription.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSubscription } from './entities/user-subscription.entity';
import { User } from '../user/entities/user.entity';
import { Subscription } from '../subscription/entities/subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserSubscription, User, Subscription])],
  providers: [UserSubscriptionResolver, UserSubscriptionService],
  exports: [UserSubscriptionService],
})
export class UserSubscriptionModule {}
