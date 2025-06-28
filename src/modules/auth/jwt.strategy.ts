// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UserService,
  ) {
    // Lấy secret và ép non-null
    const secret = config.get<string>('jwtSecret');
    if (!secret) throw new Error('Env jwtSecret is not defined');
    const opts: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    };
    super(opts);
  }

  async validate(payload: { sub: number }) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
