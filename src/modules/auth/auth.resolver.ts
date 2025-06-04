import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
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

  @Mutation(() => User)
  async googleAuthMobile(@Args('idToken') idToken: string) {
    return this.authService.validateGoogleMobileToken(idToken);
  }

  @Query(() => String)
  googleAuthUrl(): string {
    return this.authService.getGoogleAuthUrl();
  }

  @Query(() => User)
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // This endpoint will be handled by the Google strategy
    return null;
  }
}
