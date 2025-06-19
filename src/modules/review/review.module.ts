import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Reservation } from '../reservation/entities/reservation.entity';
import { Stadium } from '../stadium/entities/stadium.entity';
import { ReviewService } from './review.service';
import { ReviewResolver } from './review.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Reservation, Stadium])],
  providers: [ReviewResolver, ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
