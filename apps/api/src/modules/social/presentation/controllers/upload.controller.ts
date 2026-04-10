import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  PayloadTooLargeException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import sharp from 'sharp';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../../shared/decorators/current-user.decorator';
import { MediaUploadService } from '../../application/services/media-upload.service';

const IMAGE_MAX_WIDTH_PX = 2000;
const IMAGE_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const VIDEO_MAX_BYTES = 100 * 1024 * 1024; // 100 MB

const ALLOWED_IMAGE_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const ALLOWED_VIDEO_MIMETYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
];

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly mediaUploadService: MediaUploadService) {}

  @Post('image')
  @ApiOperation({ summary: 'Upload an image (resized to max 2000px wide)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Returns CloudFront URL' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: IMAGE_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_IMAGE_MIMETYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Invalid file type. Allowed: ${ALLOWED_IMAGE_MIMETYPES.join(', ')}`,
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadImage(
    @CurrentUser() _user: CurrentUserPayload,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > IMAGE_MAX_BYTES) {
      throw new PayloadTooLargeException(
        `Image too large. Maximum size: ${IMAGE_MAX_BYTES / 1024 / 1024}MB`,
      );
    }

    let processedBuffer = file.buffer;
    let processedMimetype = file.mimetype;

    try {
      const metadata = await sharp(file.buffer).metadata();
      const width = metadata.width ?? 0;

      if (width > IMAGE_MAX_WIDTH_PX) {
        this.logger.debug(
          `Resizing image from ${width}px to max ${IMAGE_MAX_WIDTH_PX}px`,
        );
        processedBuffer = await sharp(file.buffer)
          .resize({ width: IMAGE_MAX_WIDTH_PX, withoutEnlargement: true })
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();
        processedMimetype = 'image/jpeg';
      }
    } catch (err) {
      this.logger.warn('Sharp processing failed, uploading original', err);
    }

    const originalname = file.originalname.replace(/\.[^.]+$/, '') + '.jpg';
    const result = await this.mediaUploadService.upload(
      processedBuffer,
      processedMimetype,
      originalname,
    );

    return { url: result.url };
  }

  @Post('video')
  @ApiOperation({ summary: 'Upload a video (max 100MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Returns CloudFront URL' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: VIDEO_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_VIDEO_MIMETYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Invalid file type. Allowed: ${ALLOWED_VIDEO_MIMETYPES.join(', ')}`,
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadVideo(
    @CurrentUser() _user: CurrentUserPayload,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > VIDEO_MAX_BYTES) {
      throw new PayloadTooLargeException(
        `Video too large. Maximum size: ${VIDEO_MAX_BYTES / 1024 / 1024}MB`,
      );
    }

    const result = await this.mediaUploadService.upload(
      file.buffer,
      file.mimetype,
      file.originalname,
    );

    return { url: result.url };
  }
}
