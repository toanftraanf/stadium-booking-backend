import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddFavoriteSportInput } from './dto/add-favorite-sport.input';
import { CreateSportInput } from './dto/create-sport.input';
import { UpdateSportInput } from './dto/update-sport.input';
import { Sport } from './entities/sport.entity';
import { UserFavoriteSport } from './entities/user-favorite-sport.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class SportService {
  constructor(
    @InjectRepository(Sport)
    private readonly sportRepository: Repository<Sport>,
    @InjectRepository(UserFavoriteSport)
    private readonly userFavoriteSportRepository: Repository<UserFavoriteSport>,
    private readonly userService: UserService,
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
    // Kiểm tra user có tồn tại không
    try {
      await this.userService.findOne(input.userId);
    } catch (error) {
      throw new BadRequestException(`User with ID ${input.userId} not found`);
    }

    // Kiểm tra xem đã tồn tại trong favorite chưa
    const existingFavorite = await this.userFavoriteSportRepository.findOne({
      where: {
        userId: input.userId,
        sportId: input.sportId
      }
    });

    if (existingFavorite) {
      return existingFavorite;
    }

    // Tạo mới favorite sport
    const favoriteSport = this.userFavoriteSportRepository.create({
      userId: input.userId,
      sportId: input.sportId
    });

    try {
      return await this.userFavoriteSportRepository.save(favoriteSport);
    } catch (error) {
      // Nếu có lỗi foreign key, tạo sport trước
      if (error.code === '23503') { // PostgreSQL foreign key violation code
        // Tạo sport mới với ID tương ứng
        const sport = this.sportRepository.create({
          id: input.sportId,
          name: this.getSportNameById(input.sportId)
        });
        await this.sportRepository.save(sport);
        
        // Thử lại việc thêm favorite sport
        return await this.userFavoriteSportRepository.save(favoriteSport);
      }
      throw error;
    }
  }

  private getSportNameById(id: number): string {
    const sports = {
      1: 'Bóng đá',
      2: 'Cầu lông',
      3: 'Tennis',
      4: 'Bóng bàn',
      5: 'Bóng rổ',
      6: 'Bóng chuyền',
      7: 'Bơi lội',
      8: 'Chạy bộ',
      9: 'Yoga',
      10: 'Gym'
    };
    return sports[id] || `Sport ${id}`;
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
