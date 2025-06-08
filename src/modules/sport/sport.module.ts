import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportService } from './sport.service';
import { SportResolver } from './sport.resolver';
import { Sport } from './entities/sport.entity';
import { UserFavoriteSport } from './entities/user-favorite-sport.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sport, UserFavoriteSport])],
  providers: [SportResolver, SportService],
  exports: [SportService],
})
export class SportModule {}