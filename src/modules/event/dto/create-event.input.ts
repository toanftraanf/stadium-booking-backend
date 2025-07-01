import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  Matches,
} from 'class-validator';

@InputType()
export class CreateEventInput {
  @Field()
  @IsString()
  title: string;

  @Field(() => [Int])
  @IsArray()
  @IsInt({ each: true })
  sports: number[];

  @Field()
  @IsDateString()
  date: string;

  @Field()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  startTime: string;

  @Field()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  endTime: string;

  @Field(() => Int)
  @IsInt()
  stadiumId: number;

  @Field(() => Int)
  @IsInt()
  coachId: number;

  @Field(() => Int)
  @IsInt()
  @Min(2, { message: 'Max participants must be at least 2' })
  @Max(100, { message: 'Max participants cannot exceed 100' })
  maxParticipants: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  additionalNotes?: string;

  @Field()
  @IsBoolean()
  isSharedCost: boolean;

  @Field()
  @IsBoolean()
  isPrivate: boolean;
}
