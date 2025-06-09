import { Field, Float, InputType } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

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
