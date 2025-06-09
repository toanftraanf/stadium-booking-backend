import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';

import { AuthResponse } from './dto/auth-response.dto';

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

  @Mutation(() => AuthResponse, { name: 'authenticate' })
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

  @Mutation(() => AuthResponse)
  async googleAuthMobile(@Args('idToken') idToken: string) {
    return this.authService.validateGoogleMobileToken(idToken);
  }

  @Mutation(() => User)
  async registerOwner(
    @Args('phoneNumber') phoneNumber: string,
    @Args('fullName') fullName: string,
  ) {
    return this.authService.registerOwner(phoneNumber, fullName);
  }

  @Mutation(() => Boolean)
  logout(
    @Args('accessToken') accessToken: string,
    @Args('refreshToken', { nullable: true }) refreshToken?: string,
  ): boolean {
    return this.authService.logout(accessToken, refreshToken);
  }

  @Mutation(() => Boolean)
  async logoutFromAllDevices(@Args('userId') userId: number): Promise<boolean> {
    return this.authService.logoutFromAllDevices(userId);
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
