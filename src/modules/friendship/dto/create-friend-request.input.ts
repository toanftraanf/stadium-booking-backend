import { Field, Int, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumberString } from 'class-validator';

@InputType()
export class CreateFriendRequestInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumberString()
  recipientId: number;
}
