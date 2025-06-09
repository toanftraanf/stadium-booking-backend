import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class FileUploadInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  type?: string; // e.g., 'image', 'video', 'document'

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  folder?: string; // folder/directory for organization
}
