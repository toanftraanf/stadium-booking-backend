import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Card } from './entities/card.entity';
import { CreateCardInput } from './dto/create-card.input';
import { UpdateCardInput } from './dto/update-card.input';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
  ) {}

  async create(createCardInput: CreateCardInput): Promise<Card> {
    // If this card is being saved for next payment, uncheck all other cards for this user
    if (createCardInput.saveForNextPayment) {
      await this.cardRepository.update(
        { userId: createCardInput.userId, saveForNextPayment: true },
        { saveForNextPayment: false },
      );
    }

    const card = this.cardRepository.create(createCardInput);
    return this.cardRepository.save(card);
  }

  async update(id: number, updateCardInput: UpdateCardInput): Promise<Card> {
    // If this card is being set to save for next payment, uncheck all other cards for this user
    if (updateCardInput.saveForNextPayment) {
      const card = await this.cardRepository.findOne({ where: { id } });
      if (card) {
        await this.cardRepository.update(
          { userId: card.userId, saveForNextPayment: true, id: Not(id) },
          { saveForNextPayment: false },
        );
      }
    }

    await this.cardRepository.update(id, updateCardInput);
    return this.cardRepository.findOneOrFail({ where: { id } });
  }

  async getById(id: number): Promise<Card> {
    return this.cardRepository.findOneOrFail({ where: { id } });
  }

  async getAll(): Promise<Card[]> {
    return this.cardRepository.find();
  }

  async getByUserId(userId: number): Promise<Card[]> {
    return this.cardRepository.find({ where: { userId } });
  }

  async getSavedCardByUserId(userId: number): Promise<Card | null> {
    return this.cardRepository.findOne({
      where: { userId, saveForNextPayment: true },
    });
  }
}
