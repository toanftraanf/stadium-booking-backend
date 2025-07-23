import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsInt, IsDateString, IsEnum } from 'class-validator';
import { UserSubscriptionStatus } from '../entities/user-subscription.entity';

@InputType()
export class CreateUserSubscriptionInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  subscriptionId: number;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  endDate: Date;

  @Field(() => UserSubscriptionStatus, { nullable: true })
  @IsEnum(UserSubscriptionStatus)
  status?: UserSubscriptionStatus;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  cardId: number;
}
