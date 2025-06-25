import { Field, Float, InputType, Int } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class CreateCoachProfileInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bio?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  availability?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  yearsOfExperience?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  certifications?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  coachImages?: string[];

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  minSessionDuration?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  maxSessionDuration?: number;
}
