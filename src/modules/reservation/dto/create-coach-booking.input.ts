import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateCoachBookingInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  clientId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  coachProfileId: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  sport: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  sessionType: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  date: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;
}
