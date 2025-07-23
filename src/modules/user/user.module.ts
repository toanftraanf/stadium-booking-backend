import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFavoriteSport } from '../sport/entities/user-favorite-sport.entity';
import { User } from './entities/user.entity';
import { CoachProfile } from './entities/coach-profile.entity';
import { File } from '../upload/entities/file.entity';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { CoachProfileResolver } from './coach-profile.resolver';
import { CoachProfileService } from './coach-profile.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserFavoriteSport, CoachProfile, File]),
  ],
  providers: [
    UserResolver,
    UserService,
    CoachProfileResolver,
    CoachProfileService,
  ],
  exports: [UserService, CoachProfileService],
  controllers: [UserController],
})
export class UserModule {}
