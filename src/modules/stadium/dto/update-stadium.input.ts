import { Field, InputType, Int, Float } from '@nestjs/graphql';
import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class UpdateStadiumInput {
  @Field(() => Int)
  @IsNumber()
  id: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  googleMap?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  website?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  otherContacts?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  startTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  endTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  otherInfo?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  sports?: string[];
}
