import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateUserSubscriptionInput } from './create-user-subscription.input';
import { IsInt, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateUserSubscriptionInput extends PartialType(
  CreateUserSubscriptionInput,
) {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  id: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  cardId: number;
}
