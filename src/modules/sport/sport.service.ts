import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sport } from './entities/sport.entity';
import { UserFavoriteSport } from './entities/user-favorite-sport.entity';
import { CreateSportInput } from './dto/create-sport.input';
import { UpdateSportInput } from './dto/update-sport.input';
import { AddFavoriteSportInput } from './dto/add-favorite-sport.input';

@Injectable()
export class SportService {
  constructor(
    @InjectRepository(Sport)
    private readonly sportRepository: Repository<Sport>,
    @InjectRepository(UserFavoriteSport)
    private readonly userFavoriteSportRepository: Repository<UserFavoriteSport>,
  ) {}

  async create(createSportInput: CreateSportInput): Promise<Sport> {
    const sport = this.sportRepository.create(createSportInput);
    return this.sportRepository.save(sport);
  }

  async findAll(): Promise<Sport[]> {
    return this.sportRepository.find();
  }

  async findOne(id: number): Promise<Sport> {
    const sport = await this.sportRepository.findOne({ where: { id } });
    if (!sport) {
      throw new NotFoundException(`Sport with ID ${id} not found`);
    }
    return sport;
  }

  async update(id: number, updateSportInput: UpdateSportInput): Promise<Sport> {
    const sport = await this.findOne(id);
    Object.assign(sport, updateSportInput);
    return this.sportRepository.save(sport);
  }

  async remove(id: number): Promise<Sport> {
    const sport = await this.findOne(id);
    return this.sportRepository.remove(sport);
  }

  async addFavoriteSport(
    input: AddFavoriteSportInput,
  ): Promise<UserFavoriteSport> {
    const favoriteSport = this.userFavoriteSportRepository.create(input);
    return this.userFavoriteSportRepository.save(favoriteSport);
  }

  async removeFavoriteSport(userId: number, sportId: number): Promise<boolean> {
    const result = await this.userFavoriteSportRepository.delete({
      userId,
      sportId,
    });
    return result.affected ? result.affected > 0 : false;
  }

  async getUserFavoriteSports(userId: number): Promise<Sport[]> {
    const favoriteSports = await this.userFavoriteSportRepository.find({
      where: { userId },
      relations: ['sport'],
    });
    return favoriteSports.map((fs) => fs.sport);
  }

  async getSportWithUserCount(
    id: number,
  ): Promise<{ sport: Sport; userCount: number }> {
    const sport = await this.findOne(id);
    const userCount = await this.userFavoriteSportRepository.count({
      where: { sportId: id },
    });
    return { sport, userCount };
  }
}
