import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateReservationInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  stadiumId: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  sport: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  courtType: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  courtNumber: number;

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
  @IsString()
  status?: string;
}
