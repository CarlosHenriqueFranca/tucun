import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PushTokenOrmEntity } from '../persistence/push-token.orm-entity';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

// Lazy-load firebase-admin to avoid hard crash when not configured
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let firebaseAdmin: any = null;

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private initialized = false;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(PushTokenOrmEntity)
    private readonly pushTokenRepo: Repository<PushTokenOrmEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');

    if (!projectId || !privateKey || !clientEmail) {
      this.logger.warn(
        'Firebase credentials not configured — push notifications disabled',
      );
      return;
    }

    try {
      // Dynamic import to avoid build-time dependency on firebase-admin types
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      firebaseAdmin = require('firebase-admin');
      if (!firebaseAdmin.apps.length) {
        firebaseAdmin.initializeApp({
          credential: firebaseAdmin.credential.cert({
            projectId,
            privateKey: privateKey.replace(/\\n/g, '\n'),
            clientEmail,
          }),
        });
      }
      this.initialized = true;
      this.logger.log('Firebase Admin SDK initialized');
    } catch (err) {
      this.logger.error('Failed to initialize Firebase Admin SDK', err);
    }
  }

  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    if (!this.initialized || !firebaseAdmin) return;

    const tokens = await this.pushTokenRepo.find({ where: { userId } });

    if (tokens.length === 0) return;

    const messaging = firebaseAdmin.messaging();

    const sendPromises = tokens.map((tokenRecord) =>
      this.sendToToken(tokenRecord.token, payload),
    );

    await Promise.allSettled(sendPromises);
  }

  async sendToToken(token: string, payload: PushPayload): Promise<void> {
    if (!this.initialized || !firebaseAdmin) return;

    try {
      const messaging = firebaseAdmin.messaging();
      await messaging.send({
        token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data,
        android: {
          notification: {
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      });
    } catch (err) {
      this.logger.error(
        `Failed to send push notification to token ${token.substring(0, 20)}...`,
        err,
      );

      // If token is invalid, remove it from DB
      const errorCode = (err as { code?: string }).code;
      if (
        errorCode === 'messaging/registration-token-not-registered' ||
        errorCode === 'messaging/invalid-registration-token'
      ) {
        await this.pushTokenRepo.delete({ token });
        this.logger.warn(`Removed invalid push token: ${token.substring(0, 20)}...`);
      }
    }
  }
}
