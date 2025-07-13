import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionInput } from './dto/create-subscription.input';
import { UpdateSubscriptionInput } from './dto/update-subscription.input';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async create(
    createSubscriptionInput: CreateSubscriptionInput,
  ): Promise<Subscription> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const subscription = this.subscriptionRepository.create({
      ...createSubscriptionInput,
      price: Number(createSubscriptionInput.price),
    });
    return this.subscriptionRepository.save(subscription);
  }

  async update(
    id: number,
    updateSubscriptionInput: UpdateSubscriptionInput,
  ): Promise<Subscription> {
    await this.subscriptionRepository.update(id, {
      ...updateSubscriptionInput,
      price: Number(updateSubscriptionInput.price),
    });
    return this.subscriptionRepository.findOneOrFail({ where: { id } });
  }

  async getById(id: number): Promise<Subscription> {
    return this.subscriptionRepository.findOneOrFail({ where: { id } });
  }

  async getAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.find();
  }
}
