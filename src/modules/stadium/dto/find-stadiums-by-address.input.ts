import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

@InputType()
export class FindStadiumsByAddressInput {
  @Field()
  @IsString()
  address: string;

  @Field(() => Float, { nullable: true, defaultValue: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(50)
  radiusKm?: number = 5;
} 