import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StadiumField } from './entities/field.entity';
import { Stadium } from './entities/stadium.entity';
import { FieldResolver } from './field.resolver';
import { FieldService } from './field.service';
import { StadiumResolver } from './stadium.resolver';
import { StadiumService } from './stadium.service';

@Module({
  imports: [TypeOrmModule.forFeature([Stadium, StadiumField])],
  providers: [StadiumResolver, StadiumService, FieldResolver, FieldService],
  exports: [StadiumService, FieldService],
})
export class StadiumModule {}
