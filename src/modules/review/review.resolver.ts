import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateReviewInput } from './dto/create-review.input';
import { Review } from './entities/review.entity';
import { ReviewStats } from './entities/review-stats.entity';
import { ReviewService } from './review.service';

@Resolver(() => Review)
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  private handleError(error: any): never {
    if (error instanceof NotFoundException) {
      throw new GraphQLError(error.message, {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (error instanceof BadRequestException) {
      throw new GraphQLError(error.message, {
        extensions: { code: 'BAD_REQUEST' },
      });
    }

    // Re-throw other errors as GraphQL errors
    throw new GraphQLError(error.message || 'An unexpected error occurred', {
      extensions: {
        code: 'INTERNAL_ERROR',
        originalError: error.name || 'Unknown',
      },
    });
  }

  @Mutation(() => Review)
  async createReview(
    @Args('createReviewInput') createReviewInput: CreateReviewInput,
  ) {
    try {
      const review = await this.reviewService.create(createReviewInput);
      return review;
    } catch (error) {
      this.handleError(error);
    }
  }

  @Query(() => [Review], { name: 'stadiumReviews' })
  async findStadiumReviews(
    @Args('stadiumId', { type: () => Int }) stadiumId: number,
  ) {
    try {
      return await this.reviewService.findByStadiumId(stadiumId);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Query(() => ReviewStats, { name: 'reviewStats' })
  async getReviewStats(
    @Args('stadiumId', { type: () => Int }) stadiumId: number,
  ) {
    try {
      return await this.reviewService.getReviewStats(stadiumId);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Query(() => [Review], { name: 'userReviews' })
  async findUserReviews(@Args('userId', { type: () => Int }) userId: number) {
    try {
      return await this.reviewService.findByUserId(userId);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Query(() => Review, { name: 'review' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    try {
      return await this.reviewService.findOne(id);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Query(() => Number, { name: 'stadiumAverageRating' })
  async getStadiumAverageRating(
    @Args('stadiumId', { type: () => Int }) stadiumId: number,
  ) {
    try {
      return await this.reviewService.getStadiumAverageRating(stadiumId);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Mutation(() => Boolean, { name: 'recalculateAllStadiumRatings' })
  async recalculateAllStadiumRatings() {
    try {
      await this.reviewService.recalculateAllStadiumRatings();
      return true;
    } catch (error) {
      this.handleError(error);
    }
  }
}
