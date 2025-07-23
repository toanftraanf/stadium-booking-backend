import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import {
  UserLevel,
  UserRole,
  UserSex,
  UserStatus,
  UserType,
} from '../entities/user.entity';

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

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @Field(() => UserLevel, { nullable: true })
  @IsOptional()
  @IsEnum(UserLevel)
  level?: UserLevel;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firebaseUid?: string;
}
