import {
  Args,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { CreateFileInput } from './dto/create-file.input';
import { DirectUploadInput } from './dto/direct-upload.input';
import { FileUploadInput } from './dto/file-upload.input';
import { UpdateFileInput } from './dto/update-file.input';
import { File } from './entities/file.entity';
import { UploadSeeder } from './upload.seeder';
import { UploadService } from './upload.service';

@ObjectType()
export class UploadUrlResponse {
  @Field()
  uploadUrl: string;

  @Field()
  publicId: string;

  @Field()
  signature: string;

  @Field(() => Int)
  timestamp: number;

  @Field()
  apiKey: string;

  @Field()
  cloudName: string;

  @Field()
  folder: string;

  @Field(() => String, { nullable: true })
  fields?: string; // JSON string of additional fields
}

@ObjectType()
export class FileStatsResponse {
  @Field(() => Int)
  total: number;

  @Field(() => String) // JSON string of type counts
  byType: string;
}

@Resolver(() => File)
export class UploadResolver {
  constructor(
    private readonly uploadService: UploadService,
    private readonly uploadSeeder: UploadSeeder,
  ) {}

  @Mutation(() => Boolean)
  async seedDefaultAvatar(): Promise<boolean> {
    try {
      await this.uploadSeeder.seedDefaultAvatar();
      return true;
    } catch (error) {
      console.error('Failed to seed default avatar:', error);
      return false;
    }
  }

  @Mutation(() => File)
  createFile(@Args('createFileInput') createFileInput: CreateFileInput) {
    return this.uploadService.create(createFileInput);
  }

  @Mutation(() => UploadUrlResponse)
  generateUploadUrl(@Args('fileUploadInput') fileUploadInput: FileUploadInput) {
    const result = this.uploadService.generateUploadUrl(fileUploadInput);
    return {
      uploadUrl: result.uploadUrl,
      publicId: result.publicId,
      signature: result.signature,
      timestamp: result.timestamp,
      apiKey: result.apiKey,
      cloudName: result.cloudName,
      folder: result.folder,
      fields: result.fields ? JSON.stringify(result.fields) : undefined,
    };
  }

  @Mutation(() => File)
  confirmUpload(
    @Args('url') url: string,
    @Args('publicId') publicId: string,
    @Args('type', { nullable: true }) type?: string,
  ) {
    return this.uploadService.confirmUpload(url, publicId, type);
  }

  @Query(() => [File], { name: 'files' })
  findAll() {
    return this.uploadService.findAll();
  }

  @Query(() => [File], { name: 'filesByType' })
  findByType(@Args('type') type: string) {
    return this.uploadService.findByType(type);
  }

  @Query(() => File, { name: 'file' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.uploadService.findOne(id);
  }

  @Query(() => File, { name: 'fileByPublicId' })
  findByPublicId(@Args('publicId') publicId: string) {
    return this.uploadService.findByPublicId(publicId);
  }

  @Query(() => FileStatsResponse, { name: 'fileStats' })
  async getFileStats() {
    const stats = await this.uploadService.getFileStats();
    return {
      total: stats.total,
      byType: JSON.stringify(stats.byType),
    };
  }

  @Mutation(() => File)
  updateFile(@Args('updateFileInput') updateFileInput: UpdateFileInput) {
    return this.uploadService.update(updateFileInput.id, updateFileInput);
  }

  @Mutation(() => Boolean)
  removeFile(@Args('id', { type: () => Int }) id: number) {
    return this.uploadService.remove(id);
  }

  @Mutation(() => File)
  async testUploadSampleImage(
    @Args('folder', { nullable: true, defaultValue: 'test' }) folder?: string,
  ) {
    return this.uploadService.testUploadSampleImage(folder);
  }

  @Mutation(() => String)
  async uploadImage(
    @Args('uploadInput') uploadInput: DirectUploadInput,
  ): Promise<string> {
    return this.uploadService.uploadFileAndGetUrl(
      uploadInput.fileData,
      uploadInput.fileName,
      {
        type: uploadInput.type,
        folder: uploadInput.folder,
      },
    );
  }
}
