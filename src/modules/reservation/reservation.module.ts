import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { CoachBooking } from './entities/coach-booking.entity';
import { ReservationResolver } from './reservation.resolver';
import { ReservationService } from './reservation.service';
import { CoachBookingResolver } from './coach-booking.resolver';
import { CoachBookingService } from './coach-booking.service';
import { User } from '../user/entities/user.entity';
import { CoachProfile } from '../user/entities/coach-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, CoachBooking, User, CoachProfile]),
  ],
  providers: [
    ReservationResolver,
    ReservationService,
    CoachBookingResolver,
    CoachBookingService,
  ],
  exports: [ReservationService, CoachBookingService],
})
export class ReservationModule {}
