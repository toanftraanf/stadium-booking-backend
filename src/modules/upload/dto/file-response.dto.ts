import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FileUploadResponse {
  @Field()
  uploadUrl: string;

  @Field()
  publicId: string;

  @Field(() => [String], { nullable: true })
  requiredFields?: string[];
}

@ObjectType()
export class FileStatsData {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  images: number;

  @Field(() => Int)
  videos: number;

  @Field(() => Int)
  documents: number;

  @Field(() => Int)
  others: number;
}
