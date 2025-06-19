import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

@InputType()
export class CreateReviewInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  reservationId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  stadiumId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  userId: number;

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
