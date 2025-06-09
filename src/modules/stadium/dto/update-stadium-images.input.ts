import { Field, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateStadiumImagesInput {
  @Field(() => Int)
  @IsNumber()
  id: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  galleryUrls?: string[];
}
