import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryService } from './cloudinary.service';
import { File } from './entities/file.entity';
import { UploadResolver } from './upload.resolver';
import { UploadSeeder } from './upload.seeder';
import { UploadService } from './upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([File]), ConfigModule],
  providers: [
    UploadResolver,
    UploadService,
    UploadSeeder,
    CloudinaryService,
    {
      provide: 'CLOUDINARY',
      useFactory: (configService: ConfigService) => {
        return cloudinary.config({
          cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
          api_key: configService.get<string>('CLOUDINARY_API_KEY'),
          api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [UploadService, UploadSeeder, CloudinaryService],
})
export class UploadModule implements OnModuleInit {
  constructor(private readonly uploadSeeder: UploadSeeder) {}

  async onModuleInit() {
    await this.uploadSeeder.seedDefaultAvatar();
  }
}
