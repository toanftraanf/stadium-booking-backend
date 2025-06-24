import { CreateCoachProfileInput } from './create-coach-profile.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsNumber, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateCoachProfileInput extends PartialType(
  CreateCoachProfileInput,
) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
