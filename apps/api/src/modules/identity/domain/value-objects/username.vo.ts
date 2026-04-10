export class Username {
  private readonly _value: string;

  static readonly MIN_LENGTH = 3;
  static readonly MAX_LENGTH = 30;
  static readonly ALLOWED_PATTERN = /^[a-zA-Z0-9_]+$/;

  private constructor(value: string) {
    this._value = value;
  }

  static create(username: string): Username {
    if (!username || typeof username !== 'string') {
      throw new Error('Username is required');
    }

    const trimmed = username.trim().toLowerCase();

    if (trimmed.length < Username.MIN_LENGTH) {
      throw new Error(
        `Username must be at least ${Username.MIN_LENGTH} characters long`,
      );
    }

    if (trimmed.length > Username.MAX_LENGTH) {
      throw new Error(
        `Username must be at most ${Username.MAX_LENGTH} characters long`,
      );
    }

    if (!Username.ALLOWED_PATTERN.test(trimmed)) {
      throw new Error(
        'Username may only contain letters, numbers, and underscores',
      );
    }

    const reserved = ['admin', 'root', 'api', 'system', 'tucun', 'moderator'];
    if (reserved.includes(trimmed)) {
      throw new Error(`Username "${trimmed}" is reserved`);
    }

    return new Username(trimmed);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Username): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
