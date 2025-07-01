import { Field, InputType } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { FriendRequestStatus } from '../entities/friend-request.entity';

@InputType()
export class RespondFriendRequestInput {
  @Field(() => FriendRequestStatus)
  @IsEnum(FriendRequestStatus)
  status: FriendRequestStatus; // ACCEPTED | REJECTED
}
