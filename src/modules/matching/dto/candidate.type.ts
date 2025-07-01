// src/modules/matching/dto/candidate.type.ts
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Candidate {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Int)
  age: number;

  @Field()
  avatarUrl: string;

  @Field()
  location: string;

  @Field()
  schedule: string;
}
