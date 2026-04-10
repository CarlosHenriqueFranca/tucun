export class UserRegisteredEvent {
  static readonly EVENT_NAME = 'user.registered';

  readonly eventName = UserRegisteredEvent.EVENT_NAME;
  readonly occurredAt: Date;

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly whatsapp: string | null,
    public readonly registrationMethod: 'email' | 'whatsapp' | 'google' | 'facebook',
  ) {
    this.occurredAt = new Date();
  }
}
