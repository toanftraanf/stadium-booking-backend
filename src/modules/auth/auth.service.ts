import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { OTP_EXPIRATION_TIME } from 'src/common/constants';
import { User, UserStatus, UserRole } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { OtpService } from './otp.service';

interface GoogleUser {
  email: string;
  googleId: string;
}

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  /**
   * Login a user with OTP
   * @param phoneNumber - The phone number
   * @param otpCode - The OTP code
   * @returns The user
   */
  async login(phoneNumber: string, otpCode: string): Promise<User> {
    const user = await this.userService.findByPhoneNumber(phoneNumber);
    if (!user) {
      throw new NotFoundException('Số điện thoại không tồn tại');
    }
    const isOTPValid = await this.otpService.verifyOTP(phoneNumber, otpCode);
    if (!isOTPValid) {
      throw new UnauthorizedException('Mã OTP không hợp lệ');
    }
    return user;
  }

  /**
   * Check if a user exists and create or update it
   * @param phoneNumber - The phone number
   * @returns The user
   */
  async checkExistingUser(phoneNumber: string): Promise<User> {
    const user = await this.userService.findByPhoneNumber(phoneNumber);
    const otpCode = await this.otpService.sendOTP(phoneNumber);
    if (!user) {
      return await this.userService.create({
        phoneNumber,
        isVerified: false,
        verifyCode: otpCode,
        verifyCodeExpiresAt: new Date(Date.now() + OTP_EXPIRATION_TIME),
      });
    } else {
      return await this.userService.update(user.id, {
        verifyCode: otpCode,
        verifyCodeExpiresAt: new Date(Date.now() + OTP_EXPIRATION_TIME),
      });
    }
  }

  /**
   * Validate or create a user from Google OAuth
   * @param googleUser - The Google user data
   * @returns The user
   */
  async validateGoogleUser(googleUser: GoogleUser): Promise<User> {
    let user = await this.userService.findByEmail(googleUser.email);

    if (!user) {
      user = await this.userService.create({
        phoneNumber: googleUser.email,
        email: googleUser.email,
        googleId: googleUser.googleId,
        isVerified: true,
        status: UserStatus.ACTIVE,
      });
    } else if (!user.googleId) {
      user = await this.userService.update(user.id, {
        googleId: googleUser.googleId,
      });
    }

    return user;
  }

  /**
   * Validate Google ID token from mobile app
   * @param idToken - The Google ID token
   * @returns The user
   */
  async validateGoogleMobileToken(idToken: string): Promise<User> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const googleUser: GoogleUser = {
        email: payload.email || '',
        googleId: payload.sub,
      };

      return this.validateGoogleUser(googleUser);
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  /**
   * Get Google OAuth URL
   * @returns The Google OAuth URL
   */
  getGoogleAuthUrl(): string {
    const clientID = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const callbackURL = this.configService.get<string>('GOOGLE_CALLBACK_URL');

    if (!clientID || !callbackURL) {
      throw new Error('Missing Google OAuth configuration');
    }

    const scopes = ['email', 'profile'];
    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientID}&` +
      `redirect_uri=${encodeURIComponent(callbackURL)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scopes.join(' '))}&` +
      `access_type=offline&` +
      `prompt=consent`;

    return authUrl;
  }

  /**
   * Register a new stadium owner
   * @param phoneNumber - The phone number
   * @param fullName - The full name
   * @returns The created user
   */
  async registerOwner(phoneNumber: string, fullName: string): Promise<User> {
    const existingUser = await this.userService.findByPhoneNumber(phoneNumber);
    if (existingUser) {
      throw new BadRequestException('Số điện thoại đã được đăng ký');
    }

    const otpCode = await this.otpService.sendOTP(phoneNumber);
    return await this.userService.create({
      phoneNumber,
      fullName,
      role: UserRole.OWNER,
      isVerified: false,
      verifyCode: otpCode,
      verifyCodeExpiresAt: new Date(Date.now() + OTP_EXPIRATION_TIME),
    });
  }
}
