import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface AsaasCustomerData {
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
}

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
}

export interface AsaasSubscription {
  id: string;
  customer: string;
  billingType: string;
  value: number;
  status: string;
  nextDueDate: string;
}

export interface AsaasPayment {
  id: string;
  customer: string;
  value: number;
  status: string;
  billingType: string;
  description: string;
  dueDate: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixQrCodeId?: string;
  pixEncodedImage?: string;
  pixPayload?: string;
}

export interface CreatePaymentResult {
  payment: AsaasPayment;
  pixQrCode?: string;
  pixCopyPaste?: string;
  invoiceUrl?: string;
}

@Injectable()
export class AsaasService {
  private readonly logger = new Logger(AsaasService.name);
  private readonly client: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const baseUrl = this.configService.get<string>(
      'ASAAS_BASE_URL',
      'https://sandbox.asaas.com/api/v3',
    );
    const apiKey = this.configService.get<string>('ASAAS_API_KEY', '');

    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  async createCustomer(data: AsaasCustomerData): Promise<AsaasCustomer> {
    try {
      const response = await this.client.post<AsaasCustomer>('/customers', {
        name: data.name,
        email: data.email,
        cpfCnpj: data.cpfCnpj,
        mobilePhone: data.phone,
      });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create Asaas customer', error);
      throw new InternalServerErrorException('Failed to create payment customer');
    }
  }

  async findCustomerByEmail(email: string): Promise<AsaasCustomer | null> {
    try {
      const response = await this.client.get<{ data: AsaasCustomer[] }>('/customers', {
        params: { email },
      });
      return response.data.data?.[0] ?? null;
    } catch (error) {
      this.logger.error('Failed to find Asaas customer', error);
      return null;
    }
  }

  async createSubscription(
    customerId: string,
    plan: 'monthly' | 'annual',
    billingType: 'PIX' | 'CREDIT_CARD',
  ): Promise<AsaasSubscription> {
    const planValues: Record<string, { value: number; cycle: string }> = {
      monthly: { value: 59.9, cycle: 'MONTHLY' },
      annual: { value: 497.0, cycle: 'YEARLY' },
    };

    const { value, cycle } = planValues[plan];

    try {
      const response = await this.client.post<AsaasSubscription>('/subscriptions', {
        customer: customerId,
        billingType,
        value,
        cycle,
        nextDueDate: new Date().toISOString().split('T')[0],
        description: `Tucun Premium - Plano ${plan === 'monthly' ? 'Mensal' : 'Anual'}`,
      });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create Asaas subscription', error);
      throw new InternalServerErrorException('Failed to create subscription');
    }
  }

  async createPayment(
    customerId: string,
    value: number,
    billingType: 'PIX' | 'CREDIT_CARD' | 'APPLE_PAY',
    description: string,
  ): Promise<CreatePaymentResult> {
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);

      const response = await this.client.post<AsaasPayment>('/payments', {
        customer: customerId,
        billingType,
        value,
        dueDate: dueDate.toISOString().split('T')[0],
        description,
      });

      const payment = response.data;
      const result: CreatePaymentResult = { payment };

      if (billingType === 'PIX' && payment.id) {
        try {
          const pixResponse = await this.client.get<{
            encodedImage: string;
            payload: string;
          }>(`/payments/${payment.id}/pixQrCode`);
          result.pixQrCode = pixResponse.data.encodedImage;
          result.pixCopyPaste = pixResponse.data.payload;
        } catch {
          this.logger.warn('Failed to fetch PIX QR code');
        }
      }

      if (payment.invoiceUrl) {
        result.invoiceUrl = payment.invoiceUrl;
      }

      return result;
    } catch (error) {
      this.logger.error('Failed to create Asaas payment', error);
      throw new InternalServerErrorException('Failed to create payment');
    }
  }

  async getPayment(paymentId: string): Promise<AsaasPayment> {
    try {
      const response = await this.client.get<AsaasPayment>(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get Asaas payment ${paymentId}`, error);
      throw new InternalServerErrorException('Failed to retrieve payment');
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await this.client.delete(`/subscriptions/${subscriptionId}`);
    } catch (error) {
      this.logger.error(`Failed to cancel Asaas subscription ${subscriptionId}`, error);
      throw new InternalServerErrorException('Failed to cancel subscription');
    }
  }
}
