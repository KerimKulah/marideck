import { Controller, Post, Body, Req, Get, UseGuards, HttpStatus, HttpCode, Param, Put, Res, ParseIntPipe, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { CurrentUser } from 'src/auth/common/decorators/currentuser.decorator';
import { JwtGuard } from '../common/guards/JwtGuard';
import { LoginDto } from './dto/login-dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterDto } from './dto/register-dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { Response } from 'express';
import { Roles } from 'src/auth/common/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/common/guards/RolesGuard';
import { UserService } from 'src/auth/user/user.service';
import { UserDto } from 'src/auth/user/dto/user.dto';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshAccessDto } from './dto/refresh-access.dto';
import { RefreshAccessRequestDto } from './dto/refresh-access-request.dto';

@Controller('auth')
@ApiBearerAuth('jwt')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly userService: UserService, private readonly refreshTokenService: RefreshTokenService) { }

  /*
  ACCESS TOKEN VE REFRESH TOKEN OLUŞTURUR
  ACCESS TOKENI RESPONSE OLARAK DÖNER, REFRESH TOKENI COOKIYE ve DB'ye KAYDEDER
  */
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip || 'unknown';
    const device = req.get('user-agent') || 'unknown';

    const loginServiceResponse = await this.authService.login(loginDto, ip, device);
    const refreshToken = loginServiceResponse.refreshToken

    res.cookie('refreshToken', refreshToken.hash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: refreshToken.expiresAt.getTime() - Date.now(),
    });

    return loginServiceResponse.loginResponseDto;
  }

  /*
  COOKIE'DEN REFRESH TOKEN'İ ALIR, DBDE VARSA REVOKE EDER, COOKIE'YI TEMIZLER
  */
  @Post('refresh-access')
  async refreshAccess(@Body() refreshDto: RefreshAccessRequestDto, @Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<RefreshAccessDto> {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip || 'unknown';
    const device = req.get('user-agent') || 'unknown';

    // Refresh token cookie'den veya request body'den al
    const currentRefreshToken = refreshDto.refreshTokenHash || req.cookies['refreshToken'];
    if (!currentRefreshToken) throw new UnauthorizedException('Refresh token not found');

    const refreshResponse = await this.authService.refreshAccess(currentRefreshToken, ip, device);
    const newRefreshToken = refreshResponse.refreshToken

    res.cookie('refreshToken', newRefreshToken.hash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: newRefreshToken.expiresAt.getTime() - Date.now(),
    });

    return refreshResponse.refreshAccessDto;
  }

  /*
  JWT'yi DECODE EDER, PAYLOAD SUB(ID) İLE GÜNCEL KULLANICI BİLGİLERINI ALIR
  */
  @UseGuards(JwtGuard)
  @Get('current-user')
  async getCurrentUser(@CurrentUser() userPayload): Promise<UserDto> {
    const userDto = await this.userService.getUserDto(userPayload.id);
    return userDto;
  }

  /*
  COOKIE'DEN REFRESH TOKEN'İ ALIR, DBDE VARSA REVOKE EDER, COOKIE'YI TEMIZLER
  */
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<{ message: string }> {
    const refreshTokenHash = req.cookies['refreshToken'];

    // Refresh token DBde varsa revoke et
    if (refreshTokenHash) await this.refreshTokenService.revokeTokenByHash(refreshTokenHash);

    // Refresh token cookie'yi temizle
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return { message: 'Successfully logged out' };
  }

  /*
  JWTDEN USERI BULUR, USERE AİT TÜM REFRESH TOKEN'LERİ REVOKE EDER, İSTEĞİN ATILDIĞI CİHAZDA COOKIE'YI TEMIZLER
  */
  @Post('logout-all')
  @UseGuards(JwtGuard)
  async logoutAllDevices(@CurrentUser() userPayload, @Res({ passthrough: true }) res: Response): Promise<{ message: string }> {

    const user = await this.userService.findOne(userPayload.id);

    const response = await this.authService.logoutAllDevices(user);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    return response;
  }

  /*
  ADMIN KULLANICININ TÜM REFRESH TOKEN'LERİ REVOKE EDER VE OTURUMLARINI KAPATIR
  */
  @Post('force-logout/:userId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  async forceLogout(@Param('userId', ParseIntPipe) userId: number): Promise<{ message: string }> {
    return this.authService.forceLogout(userId);
  }

  //ChangePassword
  @Put('change-password')
  @UseGuards(JwtGuard)
  async changePassword(@CurrentUser() userPayload, @Body() changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userService.findOne(userPayload.id);
    return this.authService.changePassword(user, changePasswordDto);
  }

  //ChangeEmail
  @Put('change-email')
  @UseGuards(JwtGuard)
  async changeEmail(@CurrentUser() userPayload, @Body() changeEmailDto: ChangeEmailDto): Promise<{ message: string }> {
    const user = await this.userService.findOne(userPayload.id);
    return this.authService.changeEmail(user, changeEmailDto);
  }

  // DENEME
  @Get('deneme')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('admin')
  async deneme(): Promise<{ message: string }> {
    return { message: 'Deneme' };
  }

  // İÇE KAPALI SİSTEM OLDUĞU İÇİN GEREK YOK ÖYLESİNE YAZDIM
  // @Post('register')
  // @HttpCode(201)
  // async register(@Body() registerDto: RegisterDto): Promise<{ message: string }> {
  //   return this.authService.register(registerDto);
  // }

  // ---- BUNLAR ICIN MAIL SERVISI GEREKLI ----
  //ForgotPassword
  //ResetPassword 
}
