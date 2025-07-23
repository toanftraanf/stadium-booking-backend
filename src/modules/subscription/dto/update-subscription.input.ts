import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateSubscriptionInput } from './create-subscription.input';
import { IsInt, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateSubscriptionInput extends PartialType(
  CreateSubscriptionInput,
) {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  id: number;
}
