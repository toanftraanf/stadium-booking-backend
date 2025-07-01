import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventSport } from './entities/event-sport.entity';
import {
  EventParticipant,
  EventParticipantStatus,
} from './entities/event-participant.entity';
import { Stadium } from '../stadium/entities/stadium.entity';
import { CoachProfile } from '../user/entities/coach-profile.entity';
import { User } from '../user/entities/user.entity';
import { Sport } from '../sport/entities/sport.entity';
import { CoachBooking } from '../reservation/entities/coach-booking.entity';
import { CoachBookingService } from '../reservation/coach-booking.service';
import { CreateEventInput } from './dto/create-event.input';
import {
  Event as EventResponse,
  EventParticipant as EventParticipantResponse,
} from './dto/event-response.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventSport)
    private readonly eventSportRepository: Repository<EventSport>,
    @InjectRepository(EventParticipant)
    private readonly eventParticipantRepository: Repository<EventParticipant>,
    @InjectRepository(Stadium)
    private readonly stadiumRepository: Repository<Stadium>,
    @InjectRepository(CoachProfile)
    private readonly coachProfileRepository: Repository<CoachProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Sport)
    private readonly sportRepository: Repository<Sport>,
    @InjectRepository(CoachBooking)
    private readonly coachBookingRepository: Repository<CoachBooking>,
    private readonly coachBookingService: CoachBookingService,
    private readonly dataSource: DataSource,
  ) {}

  async createEvent(
    input: CreateEventInput,
    creatorId: number,
  ): Promise<EventResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate input data
      await this.validateEventInput(input, creatorId);

      // Convert date and validate it's not in the past
      const eventDate = new Date(input.date);
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset time for date comparison
      eventDate.setHours(0, 0, 0, 0);

      if (eventDate < now) {
        throw new BadRequestException('Event date cannot be in the past');
      }

      // Validate time order
      if (input.startTime >= input.endTime) {
        throw new BadRequestException('Start time must be before end time');
      }

      // Find coach profile and create coach booking
      const coachUser = await this.userRepository.findOne({
        where: { id: input.coachId },
      });
      if (!coachUser) {
        throw new NotFoundException('Coach not found');
      }

      const coachProfile = await this.coachProfileRepository.findOne({
        where: { userId: coachUser.id },
      });
      if (!coachProfile) {
        throw new NotFoundException('Coach profile not found');
      }

      // Calculate total price based on coach's hourly rate and event duration
      const startHour = parseInt(input.startTime.split(':')[0]);
      const startMinute = parseInt(input.startTime.split(':')[1]);
      const endHour = parseInt(input.endTime.split(':')[0]);
      const endMinute = parseInt(input.endTime.split(':')[1]);

      const durationInMinutes =
        endHour * 60 + endMinute - (startHour * 60 + startMinute);
      const durationInHours = durationInMinutes / 60;
      const totalPrice = coachProfile.hourlyRate
        ? coachProfile.hourlyRate * durationInHours
        : 0;

      // Create coach booking first
      const coachBooking = await this.coachBookingService.create({
        clientId: creatorId,
        coachProfileId: coachProfile.id,
        sport: input.sports[0].toString(), // Use first sport for booking
        sessionType: 'event',
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        totalPrice,
        notes: input.additionalNotes,
        location: undefined, // Will be set based on stadium
      });

      // Update coach booking to mark it as event booking
      await this.coachBookingRepository.update(coachBooking.id, {
        isEvent: true,
      });

      // Create the event
      const event = this.eventRepository.create({
        title: input.title,
        description: input.description,
        additionalNotes: input.additionalNotes,
        eventDate: input.date, // Use the string directly
        startTime: input.startTime,
        endTime: input.endTime,
        maxParticipants: input.maxParticipants,
        isPrivate: input.isPrivate,
        isSharedCost: input.isSharedCost,
        stadiumId: input.stadiumId,
        coachProfileId: coachProfile.id,
        coachBookingId: coachBooking.id,
        creatorId,
      });

      const savedEvent = await queryRunner.manager.save(event);

      // Create event-sport relationships
      const eventSports = input.sports.map((sportId) =>
        this.eventSportRepository.create({
          eventId: savedEvent.id,
          sportId,
        }),
      );
      await queryRunner.manager.save(eventSports);

      // Add creator as first participant with confirmed status
      const creatorParticipant = this.eventParticipantRepository.create({
        eventId: savedEvent.id,
        userId: creatorId,
        status: EventParticipantStatus.CONFIRMED,
      });
      await queryRunner.manager.save(creatorParticipant);

      await queryRunner.commitTransaction();

      // Return the complete event with all relations
      return this.getEventById(savedEvent.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getEventById(id: number): Promise<EventResponse> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: [
        'stadium',
        'coach',
        'coach.user',
        'coachBooking',
        'coachBooking.client',
        'coachBooking.coachProfile',
        'creator',
        'eventSports',
        'eventSports.sport',
        'participants',
        'participants.user',
      ],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.transformEventToResponse(event);
  }

  async getUserEvents(userId: number): Promise<EventResponse[]> {
    const events = await this.eventRepository.find({
      where: [{ creatorId: userId }, { participants: { userId } }],
      relations: [
        'stadium',
        'coach',
        'coach.user',
        'coachBooking',
        'coachBooking.client',
        'coachBooking.coachProfile',
        'creator',
        'eventSports',
        'eventSports.sport',
        'participants',
        'participants.user',
      ],
    });

    return events.map((event) => this.transformEventToResponse(event));
  }

  async getPublicEvents(): Promise<EventResponse[]> {
    const events = await this.eventRepository.find({
      where: { isPrivate: false },
      relations: [
        'stadium',
        'coach',
        'coach.user',
        'coachBooking',
        'coachBooking.client',
        'coachBooking.coachProfile',
        'creator',
        'eventSports',
        'eventSports.sport',
        'participants',
        'participants.user',
      ],
      order: { eventDate: 'ASC' },
    });

    return events.map((event) => this.transformEventToResponse(event));
  }

  async getAllEvents(): Promise<EventResponse[]> {
    const events = await this.eventRepository.find({
      relations: [
        'stadium',
        'coach',
        'coach.user',
        'coachBooking',
        'coachBooking.client',
        'coachBooking.coachProfile',
        'creator',
        'eventSports',
        'eventSports.sport',
        'participants',
        'participants.user',
      ],
      order: { eventDate: 'ASC' },
    });

    return events.map((event) => this.transformEventToResponse(event));
  }

  async joinEvent(
    eventId: number,
    userId: number,
  ): Promise<EventParticipantResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if event exists
      const event = await this.eventRepository.findOne({
        where: { id: eventId },
        relations: ['participants'],
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      // Check if event is in the future
      const eventDate = new Date(event.eventDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      eventDate.setHours(0, 0, 0, 0);

      if (eventDate < now) {
        throw new BadRequestException('Cannot join past events');
      }

      // Check if user is already a participant
      const existingParticipant = await this.eventParticipantRepository.findOne(
        {
          where: { eventId, userId },
        },
      );

      if (existingParticipant) {
        throw new BadRequestException('User is already a participant');
      }

      // Check if event is full
      const currentParticipants = await this.eventParticipantRepository.count({
        where: { eventId },
      });

      if (currentParticipants >= event.maxParticipants) {
        throw new BadRequestException('Event is full');
      }

      // Check if event is private
      if (event.isPrivate) {
        throw new BadRequestException('Cannot join private events');
      }

      // Create participant
      const participant = this.eventParticipantRepository.create({
        eventId,
        userId,
        status: EventParticipantStatus.PENDING,
      });

      const savedParticipant = await queryRunner.manager.save(participant);
      await queryRunner.commitTransaction();

      // Return participant with user relation
      const participantWithUser = await this.eventParticipantRepository.findOne(
        {
          where: { id: savedParticipant.id },
          relations: ['user'],
        },
      );

      if (!participantWithUser || !participantWithUser.user) {
        throw new Error(
          'Failed to retrieve participant with user after creation',
        );
      }

      // Transform to DTO format
      return {
        id: participantWithUser.id,
        user: participantWithUser.user,
        status: participantWithUser.status,
        joinedAt: participantWithUser.joinedAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async leaveEvent(eventId: number, userId: number): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if event exists
      const event = await this.eventRepository.findOne({
        where: { id: eventId },
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      // Check if user is the creator
      if (event.creatorId === userId) {
        throw new BadRequestException('Event creator cannot leave the event');
      }

      // Check if user is a participant
      const participant = await this.eventParticipantRepository.findOne({
        where: { eventId, userId },
      });

      if (!participant) {
        throw new BadRequestException(
          'User is not a participant of this event',
        );
      }

      // Remove participant
      await queryRunner.manager.delete(EventParticipant, { eventId, userId });
      await queryRunner.commitTransaction();

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private transformEventToResponse(event: Event): EventResponse {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      additionalNotes: event.additionalNotes,
      eventDate: event.eventDate,
      startTime: event.startTime,
      endTime: event.endTime,
      maxParticipants: event.maxParticipants,
      isPrivate: event.isPrivate,
      isSharedCost: event.isSharedCost,
      stadium: event.stadium!,
      coach: event.coach,
      coachBooking: event.coachBooking!,
      creator: event.creator!,
      sports: event.eventSports?.map((es) => es.sport!) || [],
      participants:
        event.participants?.map((p) => ({
          id: p.id,
          user: p.user!,
          status: p.status,
          joinedAt: p.joinedAt,
        })) || [],
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  private async validateEventInput(
    input: CreateEventInput,
    creatorId: number,
  ): Promise<void> {
    // Validate stadium exists
    const stadium = await this.stadiumRepository.findOne({
      where: { id: input.stadiumId },
    });
    if (!stadium) {
      throw new NotFoundException('Stadium not found');
    }

    // Validate creator exists
    const creator = await this.userRepository.findOne({
      where: { id: creatorId },
    });
    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    // Validate all sports exist
    const sports = await this.sportRepository.findByIds(input.sports);
    if (sports.length !== input.sports.length) {
      throw new BadRequestException('One or more sports not found');
    }

    // Validate unique sports
    const uniqueSports = new Set(input.sports);
    if (uniqueSports.size !== input.sports.length) {
      throw new BadRequestException('Duplicate sports are not allowed');
    }
  }
}
