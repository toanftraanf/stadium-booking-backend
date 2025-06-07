import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

@InputType()
export class UpdateStadiumInput {
  @Field(() => Int)
  @IsNotEmpty()
  id: number;

  @Field()
  name: string;

  @Field()
  googleMap: string;

  @Field()
  phone: string;

  @Field()
  email: string;

  @Field()
  website: string;

  @Field(() => [String])
  otherContacts: string[];

  @Field()
  description: string;

  @Field()
  startTime: string;

  @Field()
  endTime: string;

  @Field()
  otherInfo: string;

  @Field(() => [String])
  sports: string[];
} 