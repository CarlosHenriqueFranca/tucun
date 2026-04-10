import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  url: string;
  key: string;
}

@Injectable()
export class MediaUploadService {
  private readonly logger = new Logger(MediaUploadService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly cloudfrontDomain: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID', '');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY', '');

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.bucket = this.configService.get<string>('AWS_S3_BUCKET', 'tucun-media');
    this.cloudfrontDomain = this.configService.get<string>(
      'CLOUDFRONT_DOMAIN',
      'd123456789.cloudfront.net',
    );
  }

  async upload(
    buffer: Buffer,
    mimetype: string,
    originalFilename: string,
  ): Promise<UploadResult> {
    const extension = originalFilename.split('.').pop() ?? 'bin';
    const key = `uploads/${uuidv4()}.${extension}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
        CacheControl: 'max-age=31536000',
      });

      await this.s3Client.send(command);

      const url = `https://${this.cloudfrontDomain}/${key}`;

      return { url, key };
    } catch (error) {
      this.logger.error('Failed to upload file to S3', error);
      throw new InternalServerErrorException('Failed to upload media file');
    }
  }
}
