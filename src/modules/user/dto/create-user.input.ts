import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsPhoneNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsEmail,
  IsString,
} from 'class-validator';
import { UserRole, UserStatus, UserType } from '../entities/user.entity';

@InputType()
export class CreateUserInput {
  @Field()
  @IsPhoneNumber('VN')
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
  verifyCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  verifyCodeExpiresAt?: Date;

  @Field({ nullable: true })
  @IsOptional()
  avatarUrl?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @Field(() => UserType, { nullable: true })
  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  googleId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fullName?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  avatarId?: number;
}
