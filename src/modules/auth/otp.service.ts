import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { User, UserStatus } from '../user/entities/user.entity';
import { encrypt, decrypt } from '../../utils/encryption.util';
import { OTP_EXPIRATION_TIME } from 'src/common/constants';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Generate an OTP
   * @returns The OTP
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP to user
   * @returns The OTP
   */
  sendOTP(): string {
    const otp = this.generateOTP();
    const encryptedOTP = encrypt(otp);
    console.log(`OTP: ${otp}`);
    return encryptedOTP;
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
    const otp = this.sendOTP();
    return await this.userRepository.update(user.id, {
      verifyCode: otp,
      verifyCodeExpiresAt: new Date(Date.now() + OTP_EXPIRATION_TIME),
    });
  }
}
