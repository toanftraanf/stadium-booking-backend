import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

@InputType()
export class Step1Data {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  description: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  googleMap?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @Field(() => [String])
  @IsArray()
  otherContacts: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  otherInfo?: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @Field(() => [String])
  @IsArray()
  sports: string[];

  @Field(() => [String])
  @IsArray()
  fields: string[];

  @Field()
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  website?: string;
}

@InputType()
export class Step2Data {
  @Field()
  @IsNotEmpty()
  @IsString()
  accountName: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  bank: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  pricePerHalfHour: number;
}

@InputType()
export class CreateStadiumStepsInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  stadiumId?: number;

  @Field(() => Step1Data)
  @ValidateNested()
  @Type(() => Step1Data)
  step1Data: Step1Data;

  @Field(() => Step2Data)
  @ValidateNested()
  @Type(() => Step2Data)
  step2Data: Step2Data;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  galleryUrls?: string[];
}
