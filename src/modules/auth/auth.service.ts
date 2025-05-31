import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { OtpService } from './otp.service';
import { OTP_EXPIRATION_TIME } from 'src/common/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
  ) {}

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
    const otpCode = this.otpService.sendOTP();
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
}
