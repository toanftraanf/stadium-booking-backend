import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StadiumService } from './stadium.service';
import { StadiumResolver } from './stadium.resolver';
import { Stadium } from './entities/stadium.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stadium])],
  providers: [StadiumResolver, StadiumService],
  exports: [StadiumService],
})
export class StadiumModule {} 