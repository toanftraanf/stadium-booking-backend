import { InputType, Field } from '@nestjs/graphql';
import { IsPhoneNumber, IsOptional, IsEnum } from 'class-validator';
import { UserRole, UserStatus } from '../entities/user.entity';

@InputType()
export class CreateUserInput {
  @Field()
  @IsPhoneNumber()
  phoneNumber: string;

  @Field(() => UserRole, { nullable: true })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @Field(() => UserStatus, { nullable: true })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @Field({ nullable: true })
  @IsOptional()
  avatarUrl?: string;
}
