import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CreateFieldInput } from './create-field.input';

@InputType()
export class UpdateFieldInput extends PartialType(CreateFieldInput) {
  @Field(() => Int)
  @IsNumber()
  id: number;
}
