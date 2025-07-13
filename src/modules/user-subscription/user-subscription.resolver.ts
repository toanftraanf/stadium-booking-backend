import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserSubscriptionService } from './user-subscription.service';
import { UserSubscription } from './entities/user-subscription.entity';
import { CreateUserSubscriptionInput } from './dto/create-user-subscription.input';
import { UpdateUserSubscriptionInput } from './dto/update-user-subscription.input';

@Resolver(() => UserSubscription)
export class UserSubscriptionResolver {
  constructor(
    private readonly userSubscriptionService: UserSubscriptionService,
  ) {}

  @Mutation(() => UserSubscription)
  createUserSubscription(
    @Args('createUserSubscriptionInput')
    createUserSubscriptionInput: CreateUserSubscriptionInput,
  ): Promise<UserSubscription> {
    return this.userSubscriptionService.create(createUserSubscriptionInput);
  }

  @Mutation(() => UserSubscription)
  updateUserSubscription(
    @Args('id', { type: () => Int }) id: number,
    @Args('updateUserSubscriptionInput')
    updateUserSubscriptionInput: UpdateUserSubscriptionInput,
  ): Promise<UserSubscription> {
    return this.userSubscriptionService.update(id, updateUserSubscriptionInput);
  }

  @Query(() => UserSubscription)
  userSubscription(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<UserSubscription> {
    return this.userSubscriptionService.getById(id);
  }

  @Query(() => [UserSubscription])
  userSubscriptions(): Promise<UserSubscription[]> {
    return this.userSubscriptionService.getAll();
  }

  @Query(() => [UserSubscription])
  userSubscriptionsByUserId(
    @Args('userId', { type: () => Int }) userId: number,
  ): Promise<UserSubscription[]> {
    return this.userSubscriptionService.getByUserId(userId);
  }

  @Mutation(() => UserSubscription)
  cancelUserSubscription(
    @Args('userId', { type: () => Int }) userId: number,
  ): Promise<UserSubscription> {
    return this.userSubscriptionService.cancelUserSubscription(userId);
  }
}
