import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DEFAULT_AVATAR_URL } from 'src/common/constants';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';

@Injectable()
export class UploadSeeder {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  async seedDefaultAvatar(): Promise<void> {
    try {
      console.log('🔍 Checking for default avatar...');

      // Check if default avatar already exists
      const existingAvatar = await this.fileRepository.findOne({
        where: { id: 1 },
      });

      if (!existingAvatar) {
        console.log('📝 Creating default avatar...');

        // Create default avatar with ID 1
        const defaultAvatar = this.fileRepository.create({
          id: 1,
          url: DEFAULT_AVATAR_URL,
          type: 'image',
          publicId: 'default-avatar',
        });

        const saved = await this.fileRepository.save(defaultAvatar);
        console.log('✅ Default avatar seeded successfully with ID:', saved.id);
        console.log('🔗 Avatar URL:', saved.url);
      } else {
        console.log(
          'ℹ️ Default avatar already exists with ID:',
          existingAvatar.id,
        );
        console.log('🔗 Existing URL:', existingAvatar.url);
      }
    } catch (error) {
      console.error('❌ Error seeding default avatar:', error);
      throw error;
    }
  }
}
