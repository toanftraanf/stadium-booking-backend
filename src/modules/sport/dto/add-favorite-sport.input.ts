import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class AddFavoriteSportInput {
  @Field(() => Int)
  @IsNotEmpty()
  userId: number;

  @Field(() => Int)
  @IsNotEmpty()
  sportId: number;
}
