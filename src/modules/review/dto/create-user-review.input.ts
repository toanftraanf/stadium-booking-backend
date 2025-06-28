import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

@InputType()
export class CreateUserReviewInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  coachBookingId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  coachProfileId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  clientId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'Rating must be between 1 and 5' })
  @Max(5, { message: 'Rating must be between 1 and 5' })
  rating: number;

  @Field()
  @IsNotEmpty({ message: 'Comment cannot be empty' })
  @IsString()
  comment: string;
}
