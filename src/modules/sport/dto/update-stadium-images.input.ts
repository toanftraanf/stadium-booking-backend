import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateStadiumImagesInput {
  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  bannerUrl?: string;

  @Field(() => [String], { nullable: true })
  galleryUrls?: string[];
}
