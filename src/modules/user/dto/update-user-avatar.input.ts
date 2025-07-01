// src/modules/user/dto/update-user-avatar.input.ts
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateUserAvatarInput {
  @Field(() => Int) id: number;
  @Field() avatarUrl: string;
}
