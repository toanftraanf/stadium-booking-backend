import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserRatingBreakdown {
  @Field()
  star1: number;

  @Field()
  star2: number;

  @Field()
  star3: number;

  @Field()
  star4: number;

  @Field()
  star5: number;
}

@ObjectType()
export class UserReviewStats {
  @Field()
  averageRating: number;

  @Field()
  totalReviews: number;

  @Field(() => UserRatingBreakdown)
  ratingBreakdown: UserRatingBreakdown;
}
