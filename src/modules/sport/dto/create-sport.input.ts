import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateSportInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  description: string;
}
