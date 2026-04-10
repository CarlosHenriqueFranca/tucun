import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  picture: string | null;
  accessToken: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      // Use placeholder values if env vars not set (OAuth won't work but app won't crash)
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'PLACEHOLDER_CONFIGURE_IN_ENV',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'PLACEHOLDER_CONFIGURE_IN_ENV',
      callbackURL: `${configService.get<string>('API_URL', 'http://localhost:3333')}/api/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, name, emails, photos } = profile;

    const googleProfile: GoogleProfile = {
      googleId: id,
      email: emails?.[0]?.value ?? '',
      name: `${name?.givenName ?? ''} ${name?.familyName ?? ''}`.trim(),
      picture: photos?.[0]?.value ?? null,
      accessToken,
    };

    done(null, googleProfile);
  }
}
