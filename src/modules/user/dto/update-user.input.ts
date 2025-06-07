import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsEmail,
  IsString,
  IsDate,
} from 'class-validator';
import { UserRole, UserStatus, UserType, UserSex, UserLevel } from '../entities/user.entity';

@InputType()
export class UpdateUserInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  id?: number;

  @Field({ nullable: true })
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

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

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  dob?: Date;

  @Field(() => UserSex, { nullable: true })
  @IsOptional()
  @IsEnum(UserSex)
  sex?: UserSex;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field(() => UserLevel, { nullable: true })
  @IsOptional()
  @IsEnum(UserLevel)
  level?: UserLevel;
}
