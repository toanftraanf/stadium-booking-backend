import { Field, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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