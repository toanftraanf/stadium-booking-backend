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

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([User]),
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwtSecret'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthResolver, AuthService, OtpService, GoogleStrategy],
  exports: [AuthService, OtpService],
})
export class AuthModule {}
