import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateStadiumBankInput {
  @Field(() => Int)
  @IsNumber()
  id: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bank?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  accountName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  accountNumber?: string;
}
