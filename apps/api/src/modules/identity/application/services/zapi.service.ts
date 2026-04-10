import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class ZApiService {
  private readonly logger = new Logger(ZApiService.name);
  private readonly client: AxiosInstance;
  private readonly instance: string;
  private readonly token: string;
  private readonly clientToken: string;

  constructor(private readonly configService: ConfigService) {
    this.instance = this.configService.get<string>('ZAPI_INSTANCE', '');
    this.token = this.configService.get<string>('ZAPI_TOKEN', '');
    this.clientToken = this.configService.get<string>('ZAPI_CLIENT_TOKEN', '');

    this.client = axios.create({
      baseURL: `https://api.z-api.io/instances/${this.instance}/token/${this.token}`,
      headers: {
        'Content-Type': 'application/json',
        'client-token': this.clientToken,
      },
      timeout: 10000,
    });
  }

  async sendOtp(whatsapp: string, code: string): Promise<void> {
    if (!this.instance || !this.token) {
      this.logger.warn(
        `Z-API not configured. OTP for ${whatsapp}: ${code} (development only)`,
      );
      return;
    }

    try {
      const phone = this.formatPhone(whatsapp);
      const message =
        `🎣 *Tucun* - Seu código de verificação:\n\n` +
        `*${code}*\n\n` +
        `Válido por 5 minutos. Não compartilhe este código com ninguém.`;

      await this.client.post('/send-text', {
        phone,
        message,
      });

      this.logger.log(`OTP sent to ${whatsapp}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${whatsapp}`, error);
      throw new Error('Failed to send OTP via WhatsApp');
    }
  }

  async sendWelcomeMessage(whatsapp: string, name: string): Promise<void> {
    if (!this.instance || !this.token) {
      this.logger.warn(`Z-API not configured. Skipping welcome message to ${whatsapp}`);
      return;
    }

    try {
      const phone = this.formatPhone(whatsapp);
      const firstName = name.split(' ')[0];
      const message =
        `🎣 Bem-vindo ao *Tucun*, ${firstName}!\n\n` +
        `Estamos felizes em ter você na maior comunidade de pesca e camping do Brasil.\n\n` +
        `Explore spots de pesca, conecte-se com outros pescadores e aproveite sua experiência premium por 7 dias grátis! 🏕️`;

      await this.client.post('/send-text', {
        phone,
        message,
      });

      this.logger.log(`Welcome message sent to ${whatsapp}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome message to ${whatsapp}`, error);
      // Don't throw — welcome message is non-critical
    }
  }

  private formatPhone(whatsapp: string): string {
    // Remove any non-digits
    const digits = whatsapp.replace(/\D/g, '');

    // Z-API expects the number without the +
    // If it starts with 55 (Brazil), keep as-is; otherwise add 55
    if (digits.startsWith('55') && digits.length >= 12) {
      return digits;
    }

    return `55${digits}`;
  }
}
