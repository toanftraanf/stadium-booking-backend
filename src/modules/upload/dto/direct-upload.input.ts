import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class DirectUploadInput {
  @Field()
  @IsString()
  fileName: string;

  @Field()
  @IsString()
  fileData: string; // Base64 encoded file data

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  folder?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  type?: string; // MIME type
}
