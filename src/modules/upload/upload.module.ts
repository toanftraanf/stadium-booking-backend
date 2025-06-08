import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { UploadResolver } from './upload.resolver';
import { UploadSeeder } from './upload.seeder';
import { UploadService } from './upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  providers: [UploadResolver, UploadService, UploadSeeder],
  exports: [UploadService, UploadSeeder],
})
export class UploadModule implements OnModuleInit {
  constructor(private readonly uploadSeeder: UploadSeeder) {}

  async onModuleInit() {
    await this.uploadSeeder.seedDefaultAvatar();
  }
}
