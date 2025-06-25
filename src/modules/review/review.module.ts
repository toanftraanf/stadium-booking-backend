import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { UserReview } from './entities/user-review.entity';
import { Reservation } from '../reservation/entities/reservation.entity';
import { Stadium } from '../stadium/entities/stadium.entity';
import { CoachBooking } from '../reservation/entities/coach-booking.entity';
import { CoachProfile } from '../user/entities/coach-profile.entity';
import { User } from '../user/entities/user.entity';
import { ReviewService } from './review.service';
import { ReviewResolver } from './review.resolver';
import { UserReviewService } from './user-review.service';
import { UserReviewResolver } from './user-review.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      UserReview,
      Reservation,
      Stadium,
      CoachBooking,
      CoachProfile,
      User,
    ]),
  ],
  providers: [
    ReviewResolver,
    ReviewService,
    UserReviewResolver,
    UserReviewService,
  ],
  exports: [ReviewService, UserReviewService],
})
export class ReviewModule {}
