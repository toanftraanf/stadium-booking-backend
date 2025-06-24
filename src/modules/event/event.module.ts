import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventSport } from './entities/event-sport.entity';
import { EventParticipant } from './entities/event-participant.entity';
import { Stadium } from '../stadium/entities/stadium.entity';
import { CoachProfile } from '../user/entities/coach-profile.entity';
import { CoachBooking } from '../reservation/entities/coach-booking.entity';
import { User } from '../user/entities/user.entity';
import { Sport } from '../sport/entities/sport.entity';
import { EventService } from './event.service';
import { EventResolver } from './event.resolver';
import { CoachBookingService } from '../reservation/coach-booking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      EventSport,
      EventParticipant,
      Stadium,
      CoachProfile,
      CoachBooking,
      User,
      Sport,
    ]),
  ],
  providers: [EventResolver, EventService, CoachBookingService],
  exports: [EventService],
})
export class EventModule {}
