export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(email: string): Email {
    if (!email || typeof email !== 'string') {
      throw new Error('Email is required');
    }

    const normalized = email.trim().toLowerCase();

    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(normalized)) {
      throw new Error(`Invalid email format: ${email}`);
    }

    if (normalized.length > 254) {
      throw new Error('Email address is too long');
    }

    return new Email(normalized);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
