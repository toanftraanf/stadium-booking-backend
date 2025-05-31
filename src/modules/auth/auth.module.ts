import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserModule } from '../user/user.module';
import { OtpService } from './otp.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([User])],
  providers: [AuthResolver, AuthService, OtpService],
  exports: [AuthService, OtpService],
})
export class AuthModule {}
