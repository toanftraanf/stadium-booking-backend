import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserStatus } from './entities/user.entity';

@Controller('api')
export class UserController {
  constructor(private readonly user_service: UserService) {}

  @Post('firebase-verified')
  async firebaseVerified(
    @Body()
    body: {
      phoneNumber: string;
      firebaseUid: string;
      verified: boolean;
    },
  ) {
    const { phoneNumber, firebaseUid, verified } = body;
    if (!phoneNumber || !firebaseUid || !verified) {
      return { error: 'Missing required fields' };
    }
    let user = await this.user_service.findByPhoneNumber(phoneNumber);
    if (!user) {
      user = await this.user_service.create({
        phoneNumber,
        firebaseUid,
        isVerified: true,
        status: UserStatus.ACTIVE,
      });
    } else {
      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUid;
      }
      user.isVerified = true;
      user.status = UserStatus.ACTIVE;
      await this.user_service.update(user.id, user);
    }
    return user;
  }
}
