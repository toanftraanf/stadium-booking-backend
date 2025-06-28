import { CreateCoachBookingInput } from './create-coach-booking.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsNumber, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateCoachBookingInput extends PartialType(
  CreateCoachBookingInput,
) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
