import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sport } from './entities/sport.entity';
import { UserFavoriteSport } from './entities/user-favorite-sport.entity';
import { SportResolver } from './sport.resolver';
import { SportService } from './sport.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sport, UserFavoriteSport])],
  providers: [SportResolver, SportService],
  exports: [SportService],
})
export class SportModule {}
