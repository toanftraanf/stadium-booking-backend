import { Test, TestingModule } from '@nestjs/testing';
import { UserSubscriptionResolver } from './user-subscription.resolver';
import { UserSubscriptionService } from './user-subscription.service';

describe('UserSubscriptionResolver', () => {
  let resolver: UserSubscriptionResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSubscriptionResolver, UserSubscriptionService],
    }).compile();

    resolver = module.get<UserSubscriptionResolver>(UserSubscriptionResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
