import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserReviewService } from './user-review.service';
import { UserReview } from './entities/user-review.entity';
import { UserReviewStats } from './entities/user-review-stats.entity';
import { CreateUserReviewInput } from './dto/create-user-review.input';

@Resolver(() => UserReview)
export class UserReviewResolver {
  constructor(private readonly userReviewService: UserReviewService) {}

  @Mutation(() => UserReview)
  createUserReview(
    @Args('createUserReviewInput') createUserReviewInput: CreateUserReviewInput,
  ) {
    return this.userReviewService.create(createUserReviewInput);
  }

  @Query(() => [UserReview], { name: 'userReviewsByCoachProfile' })
  findByCoachProfile(
    @Args('coachProfileId', { type: () => Int }) coachProfileId: number,
  ) {
    return this.userReviewService.findByCoachProfileId(coachProfileId);
  }

  @Query(() => [UserReview], { name: 'userReviewsByClient' })
  findByClient(@Args('clientId', { type: () => Int }) clientId: number) {
    return this.userReviewService.findByClientId(clientId);
  }

  @Query(() => UserReview, { name: 'userReview' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.userReviewService.findOne(id);
  }

  @Query(() => UserReviewStats, { name: 'coachReviewStats' })
  getCoachReviewStats(
    @Args('coachProfileId', { type: () => Int }) coachProfileId: number,
  ) {
    return this.userReviewService.getUserReviewStats(coachProfileId);
  }

  @Query(() => Number, { name: 'coachAverageRating' })
  getCoachAverageRating(
    @Args('coachProfileId', { type: () => Int }) coachProfileId: number,
  ) {
    return this.userReviewService.getCoachAverageRating(coachProfileId);
  }
}
