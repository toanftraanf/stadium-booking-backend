// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';

import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

// ← Import thêm JwtStrategy
//import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([User]),

    // ← Đăng ký Passport và mặc định dùng strategy 'jwt'
    PassportModule.register({ defaultStrategy: 'jwt' }),

    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // giữ nguyên key bạn đang dùng
        secret: config.get<string>('jwtSecret')!,
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  providers: [
    AuthResolver,
    AuthService,
    OtpService,
    GoogleStrategy,
    // ← Thêm JwtStrategy để Passport biết strategy "jwt"
    JwtStrategy,
  ],
  exports: [
    AuthService,
    OtpService,
    // ← Xuất PassportModule/JwtModule nếu cần dùng ở module khác
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}
