import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RatingBreakdown {
  @Field(() => Int)
  star1: number;

  @Field(() => Int)
  star2: number;

  @Field(() => Int)
  star3: number;

  @Field(() => Int)
  star4: number;

  @Field(() => Int)
  star5: number;
}

@ObjectType()
export class ReviewStats {
  @Field(() => Float)
  averageRating: number;

  @Field(() => Int)
  totalReviews: number;

  @Field(() => RatingBreakdown)
  ratingBreakdown: RatingBreakdown;
}
