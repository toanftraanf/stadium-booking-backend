import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { OTP_EXPIRATION_TIME } from 'src/common/constants';
import { User, UserRole, UserStatus } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { AuthResponse } from './dto/auth-response.dto';
import { OtpService } from './otp.service';

interface GoogleUser {
  email: string;
  googleId: string;
}

interface JwtPayload {
  sub: number;
  email?: string;
  phoneNumber?: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;
  private blacklistedTokens: Set<string> = new Set();

  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  /**
   * Generate JWT tokens for a user
   * @param user - The user object
   * @returns Access and refresh tokens
   */
  private generateTokens(user: User): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    console.log('payload', payload);
    console.log('jwtSecret', this.configService.get<string>('jwtSecret'));
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwtRefreshSecret'),
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }

  /**
   * Check if a token is blacklisted
   * @param token - The JWT token
   * @returns True if blacklisted
   */
  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  /**
   * Login a user with OTP
   * @param phoneNumber - The phone number
   * @param otpCode - The OTP code
   * @returns The user with tokens
   */
  async login(phoneNumber: string, otpCode: string): Promise<AuthResponse> {
    const user = await this.userService.findByPhoneNumber(phoneNumber);
    if (!user) {
      throw new NotFoundException('Số điện thoại không tồn tại');
    }
    const isOTPValid = await this.otpService.verifyOTP(phoneNumber, otpCode);
    if (!isOTPValid) {
      throw new UnauthorizedException('Mã OTP không hợp lệ');
    }

    const tokens = this.generateTokens(user);
    return {
      user,
      ...tokens,
    };
  }

  /**
   * Logout a user by blacklisting their tokens
   * @param accessToken - The access token to blacklist
   * @param refreshToken - The refresh token to blacklist (optional)
   * @returns Success status
   */
  logout(accessToken: string, refreshToken?: string): boolean {
    try {
      // Verify the token before blacklisting
      this.jwtService.verify(accessToken);

      // Add tokens to blacklist
      this.blacklistedTokens.add(accessToken);
      if (refreshToken) {
        this.blacklistedTokens.add(refreshToken);
      }

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Logout from all devices by blacklisting all user tokens
   * @param userId - The user ID
   * @returns Success status
   */
  async logoutFromAllDevices(userId: number): Promise<boolean> {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // In a production environment, you would typically:
      // 1. Store a user's token version in the database
      // 2. Increment the version to invalidate all existing tokens
      // 3. Or maintain a database of active sessions to invalidate

      // For this implementation, we'll return success
      // The actual token invalidation would happen when tokens are verified
      return true;
    } catch {
      throw new UnauthorizedException('Logout failed');
    }
  }

  /**
   * Check if a user exists and create or update it
   * @param phoneNumber - The phone number
   * @param userRole - The user role
   * @returns The user
   */
  async checkExistingUser(
    phoneNumber: string,
    userRole: UserRole,
  ): Promise<User> {
    const user = await this.userService.findByPhoneNumber(phoneNumber);
    const otpCode = await this.otpService.sendOTP(phoneNumber);
    if (!user) {
      return await this.userService.create({
        phoneNumber,
        role: userRole,
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
   * @returns The user with tokens
   */
  async validateGoogleMobileToken(idToken: string): Promise<AuthResponse> {
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

      const user = await this.validateGoogleUser(googleUser);
      const tokens = this.generateTokens(user);

      return {
        user,
        ...tokens,
      };
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

  /**
   * Register a new customer
   * @param phoneNumber - The phone number
   * @param fullName - The full name
   * @returns The created user
   */
  async registerCustomer(phoneNumber: string, fullName: string): Promise<User> {
    const existingUser = await this.userService.findByPhoneNumber(phoneNumber);
    if (existingUser) {
      throw new BadRequestException('Số điện thoại đã được đăng ký');
    }

    const otpCode = await this.otpService.sendOTP(phoneNumber);
    return await this.userService.create({
      phoneNumber,
      fullName,
      role: UserRole.CUSTOMER,
      isVerified: false,
      verifyCode: otpCode,
      verifyCodeExpiresAt: new Date(Date.now() + OTP_EXPIRATION_TIME),
    });
  }
}
