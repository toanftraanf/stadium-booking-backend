import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stadium } from './entities/stadium.entity';
import { CreateStadiumInput } from './dto/create-stadium.input';
import { UpdateStadiumInput } from './dto/update-stadium.input';
import { UpdateStadiumBankInput } from './dto/update-stadium-bank.input';
import { UpdateStadiumImagesInput } from './dto/update-stadium-images.input';

@Injectable()
export class StadiumService {
  constructor(
    @InjectRepository(Stadium)
    private readonly stadiumRepository: Repository<Stadium>,
  ) {}

  async create(createStadiumInput: CreateStadiumInput): Promise<Stadium> {
    const stadium = this.stadiumRepository.create(createStadiumInput);
    const savedStadium = await this.stadiumRepository.save(stadium);
    return this.findOne(savedStadium.id);
  }

  async findAll(): Promise<Stadium[]> {
    return this.stadiumRepository.find({
      relations: ['user'],
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async findOne(id: number): Promise<Stadium> {
    const stadium = await this.stadiumRepository.findOne({
      where: { id },
      relations: ['user']
    });
    if (!stadium) {
      throw new NotFoundException(`Stadium with ID ${id} not found`);
    }
    return stadium;
  }

  async findByUserId(userId: number): Promise<Stadium[]> {
    return this.stadiumRepository.find({
      where: { userId },
      relations: ['user'],
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async update(id: number, updateStadiumInput: UpdateStadiumInput): Promise<Stadium> {
    await this.stadiumRepository.update(id, updateStadiumInput);
    return this.findOne(id);
  }

  async updateBank(id: number, updateStadiumBankInput: UpdateStadiumBankInput): Promise<Stadium> {
    await this.stadiumRepository.update(id, updateStadiumBankInput);
    return this.findOne(id);
  }

  async updateImages(id: number, updateStadiumImagesInput: UpdateStadiumImagesInput): Promise<Stadium> {
    await this.stadiumRepository.update(id, updateStadiumImagesInput);
    return this.findOne(id);
  }

  async remove(id: number): Promise<Stadium> {
    const stadium = await this.findOne(id);
    await this.stadiumRepository.delete(id);
    return stadium;
  }
} 