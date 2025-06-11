import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateFieldInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  fieldName: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  stadiumId: number;
}
