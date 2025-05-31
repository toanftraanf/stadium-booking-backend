import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sport } from './entities/sport.entity';

@Injectable()
export class SportSeeder {
  private readonly initialSports = [
    {
      name: 'Cầu lông',
      description:
        'Cầu lông là môn thể thao sử dụng vợt đánh cầu, được chơi giữa hai người (đơn) or hai cặp (đôi) trên sân được chia đôi bởi lưới.',
    },
    {
      name: 'Quần vợt',
      description:
        'Quần vợt là môn thể thao sử dụng vợt đánh bóng qua lưới, được chơi giữa hai người (đơn) hoặc hai cặp (đôi) trên sân cứng, đất nện hoặc cỏ.',
    },
    {
      name: 'Bóng bàn',
      description:
        'Bóng bàn là môn thể thao sử dụng vợt đánh bóng qua lưới trên bàn, được chơi giữa hai người (đơn) hoặc hai cặp (đôi) với bóng nhỏ và vợt gỗ.',
    },
    {
      name: 'Pickleball',
      description:
        'Pickleball là môn thể thao kết hợp giữa cầu lông, quần vợt và bóng bàn, được chơi trên sân nhỏ hơn quần vợt với vợt rắn và bóng nhựa có lỗ.',
    },
  ];

  constructor(
    @InjectRepository(Sport)
    private readonly sportRepository: Repository<Sport>,
  ) {}

  async seed(): Promise<void> {
    const count = await this.sportRepository.count();

    if (count === 0) {
      console.log('Seeding sports data...');
      const sports = this.initialSports.map((sport) =>
        this.sportRepository.create(sport),
      );
      await this.sportRepository.save(sports);
      console.log('Sports data seeded successfully!');
    } else {
      console.log('Sports data already exists, skipping seed.');
    }
  }
}
