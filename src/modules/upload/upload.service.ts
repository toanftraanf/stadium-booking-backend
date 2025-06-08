import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFileInput } from './dto/create-file.input';
import { FileUploadInput } from './dto/file-upload.input';
import { UpdateFileInput } from './dto/update-file.input';
import { File } from './entities/file.entity';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  /**
   * Create a new file record
   * @param createFileInput - File creation data
   * @returns Created file
   */
  async create(createFileInput: CreateFileInput): Promise<File> {
    const file = this.fileRepository.create(createFileInput);
    return await this.fileRepository.save(file);
  }

  /**
   * Find all files
   * @returns Array of files
   */
  async findAll(): Promise<File[]> {
    return await this.fileRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find files by type
   * @param type - File type (image, video, document)
   * @returns Array of files
   */
  async findByType(type: string): Promise<File[]> {
    return await this.fileRepository.find({
      where: { type },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find one file by ID
   * @param id - File ID
   * @returns File or throws NotFoundException
   */
  async findOne(id: number): Promise<File> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return file;
  }

  /**
   * Find file by public ID
   * @param publicId - Cloud storage public ID
   * @returns File or throws NotFoundException
   */
  async findByPublicId(publicId: string): Promise<File> {
    const file = await this.fileRepository.findOne({ where: { publicId } });
    if (!file) {
      throw new NotFoundException(`File with public ID ${publicId} not found`);
    }
    return file;
  }

  /**
   * Update a file record
   * @param id - File ID
   * @param updateFileInput - Updated file data
   * @returns Updated file
   */
  async update(id: number, updateFileInput: UpdateFileInput): Promise<File> {
    await this.findOne(id); // Check if exists
    await this.fileRepository.update(id, updateFileInput);
    return this.findOne(id);
  }

  /**
   * Delete a file record
   * @param id - File ID
   * @returns Success status
   */
  async remove(id: number): Promise<boolean> {
    const file = await this.findOne(id); // Check if exists
    await this.fileRepository.delete(id);
    console.log(`File deleted: ${file.url}`);
    return true;
  }

  /**
   * Generate signed upload URL (placeholder for cloud storage integration)
   * @param fileUploadInput - Upload parameters
   * @returns Upload URL and metadata
   */
  generateUploadUrl(fileUploadInput: FileUploadInput): {
    uploadUrl: string;
    publicId: string;
    fields?: Record<string, string>;
  } {
    // This is a placeholder implementation
    // In production, you would integrate with:
    // - AWS S3 presigned URLs
    // - Cloudinary upload URLs
    // - Google Cloud Storage signed URLs
    // etc.

    const timestamp = Date.now();
    const publicId = `${fileUploadInput.folder || 'uploads'}/${timestamp}_${fileUploadInput.fileName}`;

    console.log('🔗 Generating upload URL for:', {
      fileName: fileUploadInput.fileName,
      type: fileUploadInput.type,
      publicId,
    });

    // Mock upload URL - replace with actual cloud storage service
    return {
      uploadUrl: `https://api.example.com/upload/${publicId}`,
      publicId,
      fields: {
        'Content-Type': fileUploadInput.type || 'application/octet-stream',
        'x-amz-algorithm': 'AWS4-HMAC-SHA256',
        // Add other required fields for your cloud storage
      },
    };
  }

  /**
   * Confirm file upload and save to database
   * @param url - Final file URL
   * @param publicId - Cloud storage public ID
   * @param type - File type
   * @returns Created file record
   */
  async confirmUpload(
    url: string,
    publicId: string,
    type?: string,
  ): Promise<File> {
    const createFileInput: CreateFileInput = {
      url,
      publicId,
      type,
    };

    return await this.create(createFileInput);
  }

  /**
   * Get file statistics
   * @returns File count by type
   */
  async getFileStats(): Promise<{
    total: number;
    byType: Record<string, number>;
  }> {
    const files = await this.findAll();
    const total = files.length;

    const byType = files.reduce(
      (acc, file) => {
        const type = file.type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return { total, byType };
  }
}
