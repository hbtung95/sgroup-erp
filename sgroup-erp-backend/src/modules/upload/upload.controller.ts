import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('api/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file')) // Expects form-data with key 'file'
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // Basic 10MB limit for general legal docs
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const fileUrl = await this.uploadService.uploadFile(file);
    return {
      success: true,
      url: fileUrl,
      mimetype: file.mimetype,
      originalName: file.originalname,
    };
  }
}
