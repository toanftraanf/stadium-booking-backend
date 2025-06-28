import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  Int,
  ObjectType,
  Field,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { MatchingService } from './matching.service';
import { User } from '../user/entities/user.entity';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { Swipe } from './enitities/swipe.entity';

@ObjectType()
class SwipeResponse {
  @Field(() => Boolean)
  isMatch: boolean;

  @Field(() => Swipe)
  swipe: Swipe;
}

@Resolver()
export class MatchingResolver {
  constructor(private readonly matching: MatchingService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [User], { name: 'matchCandidates' })
  async getCandidates(@Context('req') req: { user: User }): Promise<User[]> {
    return this.matching.getCandidates(req.user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => SwipeResponse)
  async swipeUser(
    @Args('targetId', { type: () => Int }) targetId: number,
    @Args('liked', { type: () => Boolean }) liked: boolean,
    @Context('req') req: { user: User },
  ): Promise<SwipeResponse> {
    return this.matching.swipe(req.user.id, targetId, liked);
  }
}
