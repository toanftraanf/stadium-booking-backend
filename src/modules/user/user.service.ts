import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFavoriteSport } from '../sport/entities/user-favorite-sport.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User, UserRole, UserStatus } from './entities/user.entity';

@Injectable()
export class UserService {
  private readonly DEFAULT_AVATAR_ID = 1; // Reference to seeded default avatar

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserFavoriteSport)
    private readonly userFavoriteSportRepository: Repository<UserFavoriteSport>,
  ) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    const user = this.userRepository.create({
      ...createUserInput,
      role: createUserInput.role || UserRole.CUSTOMER,
      status: createUserInput.status || UserStatus.PENDING,
      avatarId: this.DEFAULT_AVATAR_ID, // Set default avatar ID
    });

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['favoriteSports', 'favoriteSports.sport', 'avatar'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['favoriteSports', 'favoriteSports.sport', 'avatar'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phoneNumber },
      relations: ['favoriteSports', 'favoriteSports.sport', 'avatar'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['favoriteSports', 'favoriteSports.sport', 'avatar'],
    });
  }

  async update(id: number, updateUserInput: UpdateUserInput): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserInput);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<User> {
    const user = await this.findOne(id);
    return this.userRepository.remove(user);
  }
}
