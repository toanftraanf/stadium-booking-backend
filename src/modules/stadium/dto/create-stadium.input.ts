import { Field, Float, InputType, Int } from '@nestjs/graphql';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

@InputType()
export class CreateStadiumInput {
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

  @Field()
  @IsNotEmpty()
  @IsString()
  address: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  googleMap: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  website: string;

  @Field(() => [String])
  @IsArray()
  otherContacts: string[];

  @Field()
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  otherInfo: string;

  @Field(() => [String])
  @IsArray()
  sports: string[];

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  area: number;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  numberOfFields: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  images?: string[];

  @Field(() => Int)
  @IsNotEmpty()
  userId: number;
}
