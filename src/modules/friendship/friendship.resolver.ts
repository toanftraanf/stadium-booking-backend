import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { FriendshipService } from './friendship.service';
import { FriendRequest } from './entities/friend-request.entity';
import { CreateFriendRequestInput } from './dto/create-friend-request.input';
import { RespondFriendRequestInput } from './dto/respond-friend-request.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { User } from '../user/entities/user.entity';

@Resolver(() => FriendRequest)
export class FriendshipResolver {
  constructor(private readonly service: FriendshipService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => FriendRequest)
  sendFriendRequest(
    @Args('input') input: CreateFriendRequestInput,
    @Context('user') user: User,
  ) {
    return this.service.sendRequest(user.id, input.recipientId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [FriendRequest])
  incomingFriendRequests(@Context('user') user: User) {
    return this.service.findIncomingRequests(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => FriendRequest)
  respondFriendRequest(
    @Args('requestId') requestId: string,
    @Args('input') input: RespondFriendRequestInput,
    @Context('user') user: User,
  ) {
    return this.service.respondRequest(user.id, requestId, input.status);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [User])
  myFriends(@Context('user') user: User) {
    return this.service.getFriends(user.id);
  }
}
