import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { OTP_EXPIRATION_TIME } from 'src/common/constants';
import * as twilio from 'twilio';
import { Repository, UpdateResult } from 'typeorm';
import { decrypt, encrypt } from '../../utils/encryption.util';
import { User, UserStatus } from '../user/entities/user.entity';

@Injectable()
export class OtpService {
  private twilioClient: twilio.Twilio;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    this.twilioClient = new twilio.Twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
    );
  }

  /**
   * Format phone number to E.164 format
   * @param phoneNumber - The phone number to format
   * @returns The formatted phone number
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // If number starts with 0, replace with 84
    if (cleaned.startsWith('0')) {
      return '+84' + cleaned.substring(1);
    }

    return '+' + cleaned;
  }

  /**
   * Validate phone number using Twilio Lookup API
   * @param phoneNumber - The phone number to validate
   * @returns The validated phone number in E.164 format
   * @throws BadRequestException if phone number is invalid
   */
  private async validatePhoneNumber(phoneNumber: string): Promise<string> {
    try {
      // Format the phone number first
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      console.log('Formatted phone number:', formattedNumber);

      const lookup = await this.twilioClient.lookups.v2
        .phoneNumbers(formattedNumber)
        .fetch();

      if (!lookup.valid) {
        throw new BadRequestException('Invalid phone number format');
      }

      return lookup.phoneNumber;
    } catch (error) {
      console.error('Phone validation error:', {
        message: error.message,
        code: error.code,
        status: error.status,
      });
      throw new BadRequestException(
        'Invalid phone number. Please enter a valid phone number with country code (e.g., +1234567890)',
      );
    }
  }

  /**
   * Generate an OTP
   * @returns The OTP
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP to user via SMS
   * @param phoneNumber - The phone number to send OTP to
   * @returns The encrypted OTP
   */
  async sendOTP(phoneNumber: string): Promise<string> {
    const otp = this.generateOTP();
    const encryptedOTP = encrypt(otp);

    try {
      // Validate phone number first
      const validatedPhoneNumber = await this.validatePhoneNumber(phoneNumber);

      //In development, just log the OTP instead of sending SMS
      if (this.configService.get('NODE_ENV') === 'development') {
        console.log('Development mode - OTP:', otp);
        console.log('Would send to:', validatedPhoneNumber);
        return encryptedOTP;
      }
      console.log('Attempting to send OTP to:', validatedPhoneNumber);
      console.log(
        'Using Twilio phone number:',
        this.configService.get('TWILIO_PHONE_NUMBER'),
      );

      const message = await this.twilioClient.messages.create({
        body: `Your verification code is: ${otp}. This code will expire in ${OTP_EXPIRATION_TIME / 60000} minutes.`,
        to: validatedPhoneNumber,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
      });

      console.log('Twilio message SID:', message.sid);
      console.log(`OTP sent successfully to ${validatedPhoneNumber}`);
      return encryptedOTP;
    } catch (error) {
      console.error('Failed to send OTP. Error details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        moreInfo: error.moreInfo,
        details: error.details,
      });
      throw new BadRequestException(
        'Failed to send OTP. Please try again later.',
      );
    }
  }

  /**
   * Verify an OTP
   * @param phoneNumber - The phone number
   * @param otp - The OTP
   * @returns True if the OTP is valid
   * @throws BadRequestException if OTP is expired or invalid
   */
  async verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { phoneNumber },
      select: ['id', 'verifyCode', 'verifyCodeExpiresAt'],
    });

    if (!user?.verifyCode || !user?.verifyCodeExpiresAt) {
      throw new BadRequestException(
        'Không tìm thấy mã OTP cho số điện thoại này',
      );
    }

    const expiryTime = new Date(user.verifyCodeExpiresAt);
    if (new Date() > expiryTime) {
      throw new BadRequestException(
        'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.',
      );
    }

    const decryptedOTP = decrypt(user.verifyCode);
    const isValid = decryptedOTP === otp;

    if (isValid) {
      console.log(`OTP verified successfully for ${phoneNumber}`);
      await this.userRepository.update(user.id, {
        isVerified: true,
        status: UserStatus.ACTIVE,
        verifyCode: '',
        verifyCodeExpiresAt: new Date(0),
      });
      return true;
    }

    throw new BadRequestException('Mã OTP không hợp lệ');
  }

  /**
   * Reset OTP for a user
   * @param phoneNumber - The phone number
   * @returns The updated user
   */
  async resetOTP(phoneNumber: string): Promise<UpdateResult> {
    const user = await this.userRepository.findOne({
      where: { phoneNumber },
    });
    if (!user) {
      throw new BadRequestException('Số điện thoại không tồn tại');
    }
    const otp = await this.sendOTP(phoneNumber);
    return await this.userRepository.update(user.id, {
      verifyCode: otp,
      verifyCodeExpiresAt: new Date(Date.now() + OTP_EXPIRATION_TIME),
    });
  }
}
