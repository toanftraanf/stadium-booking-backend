import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from './cloudinary.service';
import { CreateFileInput } from './dto/create-file.input';
import { FileUploadInput } from './dto/file-upload.input';
import { UpdateFileInput } from './dto/update-file.input';
import { File } from './entities/file.entity';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly cloudinaryService: CloudinaryService,
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
   * Delete a file record and from Cloudinary
   * @param id - File ID
   * @returns Success status
   */
  async remove(id: number): Promise<boolean> {
    const file = await this.findOne(id); // Check if exists

    // Delete from Cloudinary if publicId exists
    if (file.publicId) {
      try {
        const resourceType = this.getResourceType(file.type);
        await this.cloudinaryService.deleteFile(file.publicId, resourceType);
        console.log(`File deleted from Cloudinary: ${file.publicId}`);
      } catch (error) {
        console.error(`Failed to delete from Cloudinary: ${error.message}`);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    await this.fileRepository.delete(id);
    console.log(`File deleted from database: ${file.url}`);
    return true;
  }

  /**
   * Generate signed upload URL for Cloudinary
   * @param fileUploadInput - Upload parameters
   * @returns Cloudinary signed upload URL and metadata
   */
  generateUploadUrl(fileUploadInput: FileUploadInput): {
    uploadUrl: string;
    publicId: string;
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
    fields?: Record<string, string>;
  } {
    const timestamp = Date.now();
    const publicId = `${timestamp}_${fileUploadInput.fileName.replace(/\s+/g, '_')}`;

    const resourceType = this.determineResourceType(fileUploadInput.type);
    const allowedFormats = this.getAllowedFormats(fileUploadInput.type);

    const uploadData = this.cloudinaryService.generateSignedUploadUrl({
      folder: fileUploadInput.folder || 'uploads',
      publicId,
      resourceType,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFormats,
    });

    console.log('🔗 Generating Cloudinary upload URL for:', {
      fileName: fileUploadInput.fileName,
      type: fileUploadInput.type,
      publicId: `${uploadData.folder}/${publicId}`,
    });

    return {
      ...uploadData,
      publicId: `${uploadData.folder}/${publicId}`,
      folder: uploadData.folder || 'uploads',
      fields: {
        'Content-Type': fileUploadInput.type || 'application/octet-stream',
      },
    };
  }

  /**
   * Upload file directly to Cloudinary (for server-side uploads)
   * @param file - File buffer
   * @param options - Upload options
   * @returns Uploaded file record
   */
  async uploadFile(
    file: Buffer,
    options: {
      fileName: string;
      type?: string;
      folder?: string;
    },
  ): Promise<File> {
    try {
      const resourceType = this.determineResourceType(options.type);

      const uploadResult = await this.cloudinaryService.uploadFile(file, {
        folder: options.folder || 'uploads',
        resource_type: resourceType,
        public_id: `${Date.now()}_${options.fileName.replace(/\s+/g, '_')}`,
      });

      const createFileInput: CreateFileInput = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        type: options.type || this.getTypeFromFormat(uploadResult.format),
      };

      return await this.create(createFileInput);
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Upload file directly and return URL (simplified version)
   * @param fileData - Base64 encoded file data
   * @param fileName - Original file name
   * @param options - Upload options
   * @returns Cloudinary URL
   */
  async uploadFileAndGetUrl(
    fileData: string,
    fileName: string,
    options: {
      type?: string;
      folder?: string;
    } = {},
  ): Promise<string> {
    try {
      // Convert base64 to buffer
      // eslint-disable-next-line no-useless-escape
      const base64Data = fileData.replace(/^data:([A-Za-z-+\/]+);base64,/, '');
      const fileBuffer = Buffer.from(base64Data, 'base64');

      const resourceType = this.determineResourceType(options.type);

      const uploadResult = await this.cloudinaryService.uploadFile(fileBuffer, {
        folder: options.folder || 'uploads',
        resource_type: resourceType,
        public_id: `${Date.now()}_${fileName.replace(/\s+/g, '_')}`,
      });

      // Save to database
      const createFileInput: CreateFileInput = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        type: options.type || this.getTypeFromFormat(uploadResult.format),
      };

      await this.create(createFileInput);

      console.log('✅ File uploaded successfully:', {
        fileName,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      });

      return uploadResult.secure_url;
    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Test upload with sample image (for testing purposes)
   * @param folder - Cloudinary folder
   * @returns Uploaded file record
   */
  async testUploadSampleImage(folder: string = 'test'): Promise<File> {
    try {
      // Upload a sample image from a URL using Cloudinary SDK
      const uploadResult = await this.cloudinaryService.uploadFile(
        'https://picsum.photos/400/300.jpg',
        {
          folder,
          resource_type: 'image',
          public_id: `test_${Date.now()}`,
        },
      );

      const createFileInput: CreateFileInput = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        type: 'image',
      };

      console.log('✅ Test image uploaded successfully:', {
        publicId: uploadResult.public_id,
        secureUrl: uploadResult.secure_url,
      });

      return await this.create(createFileInput);
    } catch (error) {
      console.error('❌ Test upload failed:', error.message);
      throw new Error(`Test upload failed: ${error.message}`);
    }
  }

  /**
   * Confirm file upload and save to database
   * @param url - Final file URL from Cloudinary
   * @param publicId - Cloudinary public ID
   * @param type - File type
   * @returns Created file record
   */
  async confirmUpload(
    url: string,
    publicId: string,
    type?: string,
  ): Promise<File> {
    // Validate that the file exists in Cloudinary
    try {
      const resourceType = this.getResourceType(type);
      await this.cloudinaryService.getFileDetails(publicId, resourceType);
    } catch {
      throw new NotFoundException(`File not found in Cloudinary: ${publicId}`);
    }

    const createFileInput: CreateFileInput = {
      url,
      publicId,
      type,
    };

    return await this.create(createFileInput);
  }

  /**
   * Generate optimized URL for a file
   * @param publicId - Cloudinary public ID
   * @param options - Transformation options
   * @returns Optimized URL
   */
  async generateOptimizedUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string | number;
      format?: string;
    },
  ): Promise<string> {
    const file = await this.fileRepository.findOne({ where: { publicId } });
    if (!file) {
      throw new NotFoundException(`File with public ID ${publicId} not found`);
    }

    return this.cloudinaryService.generateOptimizedUrl(publicId, options);
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

  /**
   * Helper method to determine resource type based on file type
   * @param type - MIME type or file type
   * @returns Cloudinary resource type
   */
  private determineResourceType(
    type?: string,
  ): 'image' | 'video' | 'raw' | 'auto' {
    if (!type) return 'auto';

    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';

    return 'raw';
  }

  /**
   * Helper method to get resource type for existing files
   * @param type - File type from database
   * @returns Cloudinary resource type
   */
  private getResourceType(type?: string): 'image' | 'video' | 'raw' {
    if (!type) return 'image';

    if (type.startsWith('image/') || type === 'image') return 'image';
    if (type.startsWith('video/') || type === 'video') return 'video';

    return 'raw';
  }

  /**
   * Helper method to get allowed formats based on file type
   * @param type - MIME type or file type
   * @returns Array of allowed formats
   */
  private getAllowedFormats(type?: string): string[] {
    if (!type) return [];

    if (type.startsWith('image/')) {
      return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    }
    if (type.startsWith('video/')) {
      return ['mp4', 'mov', 'avi', 'mkv', 'webm'];
    }

    return [];
  }

  /**
   * Helper method to determine file type from format
   * @param format - File format from Cloudinary
   * @returns File type
   */
  private getTypeFromFormat(format: string): string {
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    const videoFormats = ['mp4', 'mov', 'avi', 'mkv', 'webm'];

    if (imageFormats.includes(format.toLowerCase())) {
      return 'image';
    }
    if (videoFormats.includes(format.toLowerCase())) {
      return 'video';
    }

    return 'document';
  }
}
