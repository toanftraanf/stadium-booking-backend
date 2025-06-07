import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

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
  startTime: string;

  @Field()
  endTime: string;

  @Field()
  otherInfo: string;

  @Field(() => [String])
  sports: string[];
} 