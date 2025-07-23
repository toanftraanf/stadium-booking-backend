import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateCardInput } from './create-card.input';
import { IsInt, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateCardInput extends PartialType(CreateCardInput) {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  id: number;
}
