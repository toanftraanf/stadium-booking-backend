import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CoachBooking,
  CoachBookingStatus,
} from './entities/coach-booking.entity';
import { CreateCoachBookingInput } from './dto/create-coach-booking.input';
import { UpdateCoachBookingInput } from './dto/update-coach-booking.input';
import { CoachProfile } from '../user/entities/coach-profile.entity';

@Injectable()
export class CoachBookingService {
  constructor(
    @InjectRepository(CoachBooking)
    private readonly coachBookingRepository: Repository<CoachBooking>,
    @InjectRepository(CoachProfile)
    private readonly coachProfileRepository: Repository<CoachProfile>,
  ) {}

  async create(
    createCoachBookingInput: CreateCoachBookingInput,
  ): Promise<CoachBooking> {
    // Validate that the coach profile exists and is available
    const coachProfile = await this.coachProfileRepository.findOne({
      where: { id: createCoachBookingInput.coachProfileId, isAvailable: true },
      relations: ['user'],
    });

    if (!coachProfile) {
      throw new NotFoundException(
        'Coach profile not found or not available for booking',
      );
    }

    // Check for conflicting bookings
    const existingBooking = await this.coachBookingRepository.findOne({
      where: {
        coachProfileId: createCoachBookingInput.coachProfileId,
        date: createCoachBookingInput.date,
        startTime: createCoachBookingInput.startTime,
        endTime: createCoachBookingInput.endTime,
        status: CoachBookingStatus.CONFIRMED,
      },
    });

    if (existingBooking) {
      throw new BadRequestException('Coach is not available at this time slot');
    }

    const { status, ...bookingData } = createCoachBookingInput;
    const coachBooking = this.coachBookingRepository.create({
      ...bookingData,
      status: (status as CoachBookingStatus) || CoachBookingStatus.PENDING,
    });
    return this.coachBookingRepository.save(coachBooking);
  }

  async findAll(): Promise<CoachBooking[]> {
    return this.coachBookingRepository.find({
      relations: ['client', 'coachProfile', 'coachProfile.user'],
    });
  }

  async findByCoachProfile(coachProfileId: number): Promise<CoachBooking[]> {
    return this.coachBookingRepository.find({
      where: { coachProfileId },
      relations: ['client', 'coachProfile', 'coachProfile.user'],
      order: { date: 'DESC', startTime: 'DESC' },
    });
  }

  async findByClient(clientId: number): Promise<CoachBooking[]> {
    return this.coachBookingRepository.find({
      where: { clientId },
      relations: ['client', 'coachProfile', 'coachProfile.user'],
      order: { date: 'DESC', startTime: 'DESC' },
    });
  }

  async findOne(id: number): Promise<CoachBooking> {
    const coachBooking = await this.coachBookingRepository.findOne({
      where: { id },
      relations: ['client', 'coachProfile', 'coachProfile.user'],
    });

    if (!coachBooking) {
      throw new NotFoundException(`Coach booking with ID ${id} not found`);
    }

    return coachBooking;
  }

  async update(
    id: number,
    updateCoachBookingInput: UpdateCoachBookingInput,
  ): Promise<CoachBooking> {
    const coachBooking = await this.findOne(id);
    Object.assign(coachBooking, updateCoachBookingInput);
    return this.coachBookingRepository.save(coachBooking);
  }

  async remove(id: number): Promise<CoachBooking> {
    const coachBooking = await this.findOne(id);
    return this.coachBookingRepository.remove(coachBooking);
  }

  async cancelBooking(id: number): Promise<CoachBooking> {
    const coachBooking = await this.findOne(id);
    coachBooking.status = CoachBookingStatus.CANCELLED;
    return this.coachBookingRepository.save(coachBooking);
  }

  async confirmBooking(id: number): Promise<CoachBooking> {
    const coachBooking = await this.findOne(id);
    coachBooking.status = CoachBookingStatus.CONFIRMED;
    return this.coachBookingRepository.save(coachBooking);
  }
}
