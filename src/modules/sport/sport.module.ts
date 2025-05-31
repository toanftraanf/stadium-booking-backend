import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportService } from './sport.service';
import { SportResolver } from './sport.resolver';
import { Sport } from './entities/sport.entity';
import { UserFavoriteSport } from './entities/user-favorite-sport.entity';
import { SportSeeder } from './sport.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Sport, UserFavoriteSport])],
  providers: [SportResolver, SportService, SportSeeder],
  exports: [SportService],
})
export class SportModule implements OnModuleInit {
  constructor(private readonly sportSeeder: SportSeeder) {}

  async onModuleInit() {
    await this.sportSeeder.seed();
  }
}
