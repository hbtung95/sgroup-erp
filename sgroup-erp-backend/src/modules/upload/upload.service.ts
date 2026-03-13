import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  /**
   * For local testing, we just return the local file path.
   * In production, this service would upload to S3/GCS and return the signed URL.
   */
  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Convert local path to a URL accessible path
    // Assumption: we will open an express static route at /uploads mapping to the root uploads folder
    const url = `/uploads/${file.filename}`;
    return url;
  }
}
