import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from '../../application/dtos/register.dto';
import { LoginDto } from '../../application/dtos/login.dto';
import { SendOtpDto } from '../../application/dtos/send-otp.dto';
import { VerifyOtpDto } from '../../application/dtos/verify-otp.dto';
import { RefreshTokenDto } from '../../application/dtos/refresh-token.dto';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { SendOtpUseCase } from '../../application/use-cases/send-otp.use-case';
import { VerifyOtpUseCase } from '../../application/use-cases/verify-otp.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { Public } from '../../../../shared/decorators/public.decorator';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import { TokenService } from '../../application/services/token.service';
import { v4 as uuidv4 } from 'uuid';

interface AuthenticatedRequest extends Request {
  user: {
    sub?: string;
    email?: string;
    googleId?: string;
    facebookId?: string;
    name?: string;
    picture?: string | null;
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly sendOtpUseCase: SendOtpUseCase,
    private readonly verifyOtpUseCase: VerifyOtpUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user with email and password' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async register(@Body() dto: RegisterDto) {
    return this.registerUserUseCase.execute(dto);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Post('otp/send')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP code via WhatsApp' })
  @ApiBody({ type: SendOtpDto })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid phone number or rate limit exceeded' })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.sendOtpUseCase.execute(dto);
  }

  @Post('otp/verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and login/register via WhatsApp' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'OTP verified, tokens returned' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.verifyOtpUseCase.execute(dto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'New access token returned' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout current session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @CurrentUser() user: { sub: string },
    @Body() body: { refreshToken?: string; logoutAll?: boolean },
  ) {
    return this.logoutUseCase.execute({
      userId: user.sub,
      refreshToken: body.refreshToken,
      logoutAll: body.logoutAll,
    });
  }

  @Get('google')
  @Public()
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth2 login' })
  @ApiResponse({ status: 302, description: 'Redirect to Google' })
  googleAuth() {
    // Handled by Passport
  }

  @Get('google/callback')
  @Public()
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth2 callback' })
  async googleCallback(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const profile = req.user;
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');

    try {
      const tokens = await this.handleOAuthLogin(profile, 'google');
      const redirectUrl = `${appUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
      return res.redirect(redirectUrl);
    } catch {
      return res.redirect(`${appUrl}/auth/error?message=google_auth_failed`);
    }
  }

  @Get('facebook')
  @Public()
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Initiate Facebook OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirect to Facebook' })
  facebookAuth() {
    // Handled by Passport
  }

  @Get('facebook/callback')
  @Public()
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  async facebookCallback(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const profile = req.user;
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');

    try {
      const tokens = await this.handleOAuthLogin(profile, 'facebook');
      const redirectUrl = `${appUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
      return res.redirect(redirectUrl);
    } catch {
      return res.redirect(`${appUrl}/auth/error?message=facebook_auth_failed`);
    }
  }

  private async handleOAuthLogin(
    profile: AuthenticatedRequest['user'],
    provider: 'google' | 'facebook',
  ) {
    // Simplified OAuth handler — in production this would use a dedicated use-case
    // that finds or creates the user based on the OAuth profile
    const mockUserId = uuidv4();
    const tokens = this.tokenService.generateTokenPair({
      sub: mockUserId,
      email: profile.email || '',
      role: 'user',
      subscriptionTier: 'free',
    });

    await this.tokenService.storeRefreshToken(mockUserId, tokens.refreshToken);
    return tokens;
  }
}
