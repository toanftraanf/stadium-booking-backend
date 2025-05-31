import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { OtpService } from './otp.service';

@Resolver(() => User)
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}

  @Mutation(() => User)
  async checkExistingUser(@Args('phoneNumber') phoneNumber: string) {
    return this.authService.checkExistingUser(phoneNumber);
  }

  @Mutation(() => User, { name: 'authenticate' })
  async login(
    @Args('phoneNumber') phoneNumber: string,
    @Args('otp') otp: string,
  ) {
    return this.authService.login(phoneNumber, otp);
  }

  @Mutation(() => Boolean)
  async resetOTP(@Args('phoneNumber') phoneNumber: string): Promise<boolean> {
    try {
      await this.otpService.resetOTP(phoneNumber);
      return true;
    } catch {
      return false;
    }
  }
}
