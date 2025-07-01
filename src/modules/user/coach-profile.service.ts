import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoachProfile } from './entities/coach-profile.entity';
import { User, UserType } from './entities/user.entity';
import { CreateCoachProfileInput } from './dto/create-coach-profile.input';
import { UpdateCoachProfileInput } from './dto/update-coach-profile.input';

@Injectable()
export class CoachProfileService {
  constructor(
    @InjectRepository(CoachProfile)
    private readonly coachProfileRepository: Repository<CoachProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createCoachProfileInput: CreateCoachProfileInput,
  ): Promise<CoachProfile> {
    // Verify the user exists and is a coach
    const user = await this.userRepository.findOne({
      where: { id: createCoachProfileInput.userId, userType: UserType.COACH },
    });

    if (!user) {
      throw new BadRequestException('User not found or not a coach');
    }

    // Check if coach profile already exists
    const existingProfile = await this.coachProfileRepository.findOne({
      where: { userId: createCoachProfileInput.userId },
    });

    if (existingProfile) {
      throw new BadRequestException(
        'Coach profile already exists for this user',
      );
    }

    const coachProfile = this.coachProfileRepository.create(
      createCoachProfileInput,
    );
    return this.coachProfileRepository.save(coachProfile);
  }

  async findAll(): Promise<CoachProfile[]> {
    return this.coachProfileRepository.find({
      relations: [
        'user',
        'user.avatar',
        'user.favoriteSports',
        'user.favoriteSports.sport',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findAvailableCoaches(): Promise<CoachProfile[]> {
    return this.coachProfileRepository.find({
      where: { isAvailable: true },
      relations: [
        'user',
        'user.avatar',
        'user.favoriteSports',
        'user.favoriteSports.sport',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<CoachProfile> {
    const coachProfile = await this.coachProfileRepository.findOne({
      where: { id },
      relations: [
        'user',
        'user.avatar',
        'user.favoriteSports',
        'user.favoriteSports.sport',
      ],
    });

    if (!coachProfile) {
      throw new NotFoundException(`Coach profile with ID ${id} not found`);
    }

    if (!coachProfile.user) {
      console.warn(`Coach profile ${id} has no associated user`);
    }

    return coachProfile;
  }

  async findByUserId(userId: number): Promise<CoachProfile | null> {
    return this.coachProfileRepository.findOne({
      where: { userId },
      relations: [
        'user',
        'user.avatar',
        'user.favoriteSports',
        'user.favoriteSports.sport',
      ],
    });
  }

  async update(
    id: number,
    updateCoachProfileInput: UpdateCoachProfileInput,
  ): Promise<CoachProfile> {
    const coachProfile = await this.findOne(id);
    Object.assign(coachProfile, updateCoachProfileInput);
    return this.coachProfileRepository.save(coachProfile);
  }

  async remove(id: number): Promise<CoachProfile> {
    const coachProfile = await this.findOne(id);
    return this.coachProfileRepository.remove(coachProfile);
  }

  async toggleAvailability(id: number): Promise<CoachProfile> {
    const coachProfile = await this.findOne(id);
    coachProfile.isAvailable = !coachProfile.isAvailable;
    return this.coachProfileRepository.save(coachProfile);
  }

  async getUserByCoachProfileId(coachProfileId: number): Promise<User | null> {
    const coachProfile = await this.coachProfileRepository.findOne({
      where: { id: coachProfileId },
      relations: ['user'],
    });
    return coachProfile?.user || null;
  }
}
