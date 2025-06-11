import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
}

@Injectable()
export class CloudinaryService {
  /**
   * Upload a file to Cloudinary
   * @param file - Buffer or file path
   * @param options - Upload options
   * @returns Upload result with URL and metadata
   */
  async uploadFile(
    file: Buffer | string,
    options?: {
      folder?: string;
      public_id?: string;
      resource_type?: 'image' | 'video' | 'raw' | 'auto';
      transformation?: any[];
    },
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: options?.folder || 'uploads',
        resource_type: options?.resource_type || 'auto',
        public_id: options?.public_id,
        transformation: options?.transformation,
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              url: result.url,
              format: result.format,
              resource_type: result.resource_type,
              bytes: result.bytes,
              width: result.width,
              height: result.height,
            });
          } else {
            reject(new Error('Upload failed: No result returned'));
          }
        },
      );

      if (Buffer.isBuffer(file)) {
        uploadStream.end(file);
      } else {
        cloudinary.uploader
          .upload(file, uploadOptions)
          .then(resolve)
          .catch(reject);
      }
    });
  }

  /**
   * Delete a file from Cloudinary
   * @param publicId - The public ID of the file to delete
   * @param resourceType - Type of resource (image, video, raw)
   * @returns Deletion result
   */
  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image',
  ): Promise<{ result: string }> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Generate a signed upload URL for direct uploads from frontend
   * @param options - Upload parameters
   * @returns Signed upload URL and parameters
   */
  generateSignedUploadUrl(options?: {
    folder?: string;
    publicId?: string;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
    maxFileSize?: number;
    allowedFormats?: string[];
  }): {
    uploadUrl: string;
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    publicId?: string;
    folder?: string;
  } {
    const timestamp = Math.round(Date.now() / 1000);
    const params: any = {
      timestamp,
      folder: options?.folder || 'uploads',
    };

    if (options?.publicId) {
      params.public_id = options.publicId;
    }

    if (options?.resourceType) {
      params.resource_type = options.resourceType;
    }

    if (options?.maxFileSize) {
      params.max_file_size = options.maxFileSize;
    }

    if (options?.allowedFormats) {
      params.allowed_formats = options.allowedFormats.join(',');
    }

    const signature = cloudinary.utils.api_sign_request(
      params,
      cloudinary.config().api_secret!,
    );

    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudinary.config().cloud_name}/upload`,
      signature,
      timestamp,
      apiKey: cloudinary.config().api_key!,
      cloudName: cloudinary.config().cloud_name!,
      publicId: options?.publicId,
      folder: options?.folder || 'uploads',
    };
  }

  /**
   * Generate optimized URL for an uploaded file
   * @param publicId - The public ID of the file
   * @param options - Transformation options
   * @returns Optimized URL
   */
  generateOptimizedUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string | number;
      format?: string;
      resourceType?: 'image' | 'video' | 'raw';
    },
  ): string {
    const transformations: any[] = [];

    if (options?.width || options?.height) {
      const transformation: any = {};
      if (options.width) transformation.width = options.width;
      if (options.height) transformation.height = options.height;
      if (options.crop) transformation.crop = options.crop;
      transformations.push(transformation);
    }

    if (options?.quality) {
      transformations.push({ quality: options.quality });
    }

    if (options?.format) {
      transformations.push({ format: options.format });
    }

    return cloudinary.url(publicId, {
      resource_type: options?.resourceType || 'image',
      transformation: transformations,
      secure: true,
    });
  }

  /**
   * Get file details from Cloudinary
   * @param publicId - The public ID of the file
   * @param resourceType - Type of resource
   * @returns File details
   */
  async getFileDetails(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image',
  ): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to get file details: ${error.message}`);
    }
  }
}
