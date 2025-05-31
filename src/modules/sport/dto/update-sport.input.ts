import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

@InputType()
export class UpdateSportInput {
  @Field(() => Int)
  @IsNotEmpty()
  id: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
