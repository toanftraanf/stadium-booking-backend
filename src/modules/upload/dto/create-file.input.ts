import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

@InputType()
export class CreateFileInput {
  @Field()
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  publicId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  type?: string; // e.g., 'image', 'video', 'document'
}
