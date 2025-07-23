import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SubscriptionService } from './subscription.service';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionInput } from './dto/create-subscription.input';
import { UpdateSubscriptionInput } from './dto/update-subscription.input';

@Resolver(() => Subscription)
export class SubscriptionResolver {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Mutation(() => Subscription)
  createSubscription(
    @Args('createSubscriptionInput')
    createSubscriptionInput: CreateSubscriptionInput,
  ): Promise<Subscription> {
    return this.subscriptionService.create(createSubscriptionInput);
  }

  @Mutation(() => Subscription)
  updateSubscription(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateSubscriptionInput')
    updateSubscriptionInput: UpdateSubscriptionInput,
  ): Promise<Subscription> {
    return this.subscriptionService.update(id, updateSubscriptionInput);
  }

  @Query(() => Subscription)
  subscription(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Subscription> {
    return this.subscriptionService.getById(id);
  }

  @Query(() => [Subscription])
  subscriptions(): Promise<Subscription[]> {
    return this.subscriptionService.getAll();
  }
}
