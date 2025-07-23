import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UserSubscription,
  UserSubscriptionStatus,
} from './entities/user-subscription.entity';
import { User } from '../user/entities/user.entity';
import { CreateUserSubscriptionInput } from './dto/create-user-subscription.input';
import { UpdateUserSubscriptionInput } from './dto/update-user-subscription.input';

@Injectable()
export class UserSubscriptionService {
  constructor(
    @InjectRepository(UserSubscription)
    private readonly userSubscriptionRepository: Repository<UserSubscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createUserSubscriptionInput: CreateUserSubscriptionInput,
  ): Promise<UserSubscription> {
    const userSubscription = this.userSubscriptionRepository.create(
      createUserSubscriptionInput,
    );
    const saved = await this.userSubscriptionRepository.save(userSubscription);

    // Update user's hasSubscription field
    await this.updateUserHasSubscription(createUserSubscriptionInput.userId);

    return saved;
  }

  async update(
    id: number,
    updateUserSubscriptionInput: UpdateUserSubscriptionInput,
  ): Promise<UserSubscription> {
    const existing = await this.userSubscriptionRepository.findOne({
      where: { id },
    });
    await this.userSubscriptionRepository.update(
      id,
      updateUserSubscriptionInput,
    );
    const updated = await this.userSubscriptionRepository.findOneOrFail({
      where: { id },
    });

    // Update user's hasSubscription field if userId changed or status changed
    const userId = updateUserSubscriptionInput.userId || existing?.userId;
    if (userId) {
      await this.updateUserHasSubscription(userId);
    }

    return updated;
  }

  async getById(id: number): Promise<UserSubscription> {
    return this.userSubscriptionRepository.findOneOrFail({ where: { id } });
  }

  async getAll(): Promise<UserSubscription[]> {
    return this.userSubscriptionRepository.find();
  }

  async getByUserId(userId: number): Promise<UserSubscription[]> {
    return this.userSubscriptionRepository.find({
      where: { userId },
      relations: ['subscription'],
    });
  }

  async cancelUserSubscription(userId: number): Promise<UserSubscription> {
    // Find the user's active subscription
    const userSubscription = await this.userSubscriptionRepository.findOne({
      where: { userId, isCancelled: false },
    });

    if (!userSubscription) {
      throw new Error('No active subscription found for this user');
    }

    // Mark as cancelled
    await this.userSubscriptionRepository.update(
      { id: userSubscription.id },
      { isCancelled: true },
    );

    // Update user's hasSubscription field
    await this.updateUserHasSubscription(userId);

    return this.userSubscriptionRepository.findOneOrFail({
      where: { id: userSubscription.id },
    });
  }

  private async updateUserHasSubscription(userId: number): Promise<void> {
    // Check if user has any active subscription that is not cancelled
    const activeSubscription = await this.userSubscriptionRepository.findOne({
      where: {
        userId,
        status: UserSubscriptionStatus.ACTIVE,
        isCancelled: false,
      },
    });

    // Update user's hasSubscription field
    await this.userRepository.update(
      { id: userId },
      { hasSubscription: !!activeSubscription },
    );
  }
}
