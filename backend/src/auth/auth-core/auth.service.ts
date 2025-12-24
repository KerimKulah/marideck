import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { RefreshTokenService } from './refresh-token.service';
import { Repository } from 'typeorm';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshAccessDto } from './dto/refresh-access.dto';
import { LoginDto } from './dto/login-dto';
import { Role } from 'src/auth/role/entities/role.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register-dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(RefreshToken) private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly refreshTokenService: RefreshTokenService,
  ) { }

  //LOGIN 
  async login(loginDto: LoginDto, ip: string, device: string): Promise<{ loginResponseDto: LoginResponseDto; refreshToken: RefreshToken }> {
    this.logger.log(`Login attempt for email: ${loginDto.email}, IP: ${ip}, Device: ${device}`);

    // Mail kontrolü
    const user = await this.userRepository.findOne({ where: { email: loginDto.email }, relations: ['roles'] });
    if (!user) {
      this.logger.warn(`Giriş başarısız - Kullanıcı Adı veya Şifre Hatalı`);
      throw new UnauthorizedException('Hatalı Kullanıcı Adı veya Şifre');
    }

    // Şifre kontrolü
    const passwordMatches = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordMatches) {
      this.logger.warn(`Giriş başarısız - Kullanıcı Adı veya Şifre Hatalı`);
      throw new UnauthorizedException('Hatalı Kullanıcı Adı veya Şifre');
    }

    // Aktif kontrolü
    if (user.isActive === false) {
      this.logger.warn(`Giriş başarısız - Kullanıcı Aktif Değil`);
      throw new UnauthorizedException('Kullanıcı Aktif Değil');
    }

    // Access Token olusturma
    const accessToken = this.jwtService.sign({ sub: user.id }, { expiresIn: process.env.JWT_EXPIRES_IN });

    // Refresh Token olusturma, db kaydetme (httponlycookie kaydetme controllerda yapılmalı.)
    const refreshToken = await this.refreshTokenService.createRefreshTokenAndSave(user, ip, device);

    // Oluşturulan access token expiration süresini al
    const decoded = this.jwtService.decode(accessToken) as { exp?: number } | null;
    if (!decoded || typeof decoded.exp !== 'number') {
      this.logger.error(`Giriş başarısız - Geçersiz Token Süresi`);
      throw new InternalServerErrorException('Geçersiz Token Süresi');
    }

    // LoginResponseDto oluştur ve return et
    const loginResponseDto = new LoginResponseDto();
    loginResponseDto.accessToken = accessToken;
    loginResponseDto.accessTokenExpiresAt = new Date(decoded.exp * 1000).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

    this.logger.log(`Login successful for user: ${user.id}, email: ${user.email}`);
    return { loginResponseDto, refreshToken };
  }

  // REFRESH ACCESS 
  async refreshAccess(hash: string, ip: string, device: string): Promise<{ refreshAccessDto: RefreshAccessDto, refreshToken: RefreshToken }> {
    this.logger.log(`Refresh token attempt, IP: ${ip}, Device: ${device}`);

    // Refresh token dogrulama
    const refreshToken = await this.refreshTokenService.validateRefreshToken(hash);

    if (!refreshToken) {
      this.logger.warn(`Invalid refresh token used, IP: ${ip}, Device: ${device}`);
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Refresh Tokenden Kullanıcı bilgilerini al
    const user = refreshToken.user;

    // Mevcut Refresh token revoke et ve kullanıldı olarak işaretle
    await this.refreshTokenRepository.update({ hash }, { isRevoked: true, usedAt: new Date() });

    // Access token oluştur
    const accessToken = this.jwtService.sign({ sub: user.id }, { expiresIn: process.env.JWT_EXPIRES_IN });

    // Yeni refresh token oluştur ve kaydet
    const newRefreshToken = await this.refreshTokenService.createRefreshTokenAndSave(user, ip, device);

    // Access token expiration süresini al
    const decoded = this.jwtService.decode(accessToken) as { exp?: number } | null;
    if (!decoded || typeof decoded.exp !== 'number') {
      this.logger.error(`Invalid token expiration during refresh for user: ${user.id}`);
      throw new InternalServerErrorException('Invalid token expiration');
    }

    const refreshAccessDto = new RefreshAccessDto();
    refreshAccessDto.accessToken = accessToken;
    refreshAccessDto.accessTokenExpiresAt = new Date(decoded.exp * 1000).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

    this.logger.log(`Token refresh successful for user: ${user.id}`);
    return { refreshAccessDto, refreshToken: newRefreshToken };
  }

  // REGISTER (İçe kapalı sistemler kullanılmaz)
  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    let { firstName, lastName, email, password, confirmPassword } = registerDto;
    email = email.toLowerCase();

    this.logger.log(`Registration attempt for email: ${email}`);

    // Mail önceden kayıtlı mı?
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      this.logger.warn(`Registration failed - Email already exists: ${email}`);
      throw new BadRequestException('Email already exists');
    }

    // Password eşleşiyor mu?
    if (password !== confirmPassword) {
      this.logger.warn(`Registration failed - Passwords do not match for email: ${email}`);
      throw new BadRequestException('Passwords do not match');
    }

    const role = await this.roleRepository.findOne({ where: { name: 'employee' } });
    if (!role) {
      this.logger.error(`Registration failed - Role "employee" not found`);
      throw new NotFoundException('Role "employee" not found');
    }

    const user = this.userRepository.create({
      firstName,
      lastName,
      email,
      password: await bcrypt.hash(password, 10),
      roles: [role],
    });

    await this.userRepository.save(user);

    this.logger.log(`User registered successfully: ${email}, ID: ${user.id}`);
    return { message: 'User registered successfully' };
  }

  // CHANGE PASSWORD (OTURUMDAKI KULLANICI)
  async changePassword(user: User, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const { oldPassword, newPassword, confirmPassword } = changePasswordDto;

    this.logger.log(`Password change attempt for user ID: ${user.id}`);

    // Yeni şifre ile tekrar şifresi uyuşuyor mu?
    if (newPassword !== confirmPassword) {
      this.logger.warn(`Password change failed - New passwords do not match for user ID: ${user.id}`);
      throw new BadRequestException('New passwords do not match');
    }

    // Kullanıcıyı veritabanından tekrar çekmek daha güvenlidir (şifre hash'inin güncel olduğunu garanti eder)
    const existingUser = await this.userRepository.findOne({ where: { id: user.id } });
    if (!existingUser) {
      this.logger.error(`Password change failed - User not found for ID: ${user.id}`);
      throw new NotFoundException('User not found');
    }

    // Eski şifre doğru mu?
    const passwordMatches = await bcrypt.compare(oldPassword, existingUser.password);
    if (!passwordMatches) {
      this.logger.warn(`Password change failed - Old password is incorrect for user ID: ${user.id}`);
      throw new UnauthorizedException('Old password is incorrect');
    }

    // Yeni şifre hash'lenip kaydediliyor
    existingUser.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(existingUser);

    this.logger.log(`Password changed successfully for user ID: ${user.id}`);
    return { message: 'Password changed successfully' };
  }

  // CHANGE EMAIL(OTURUMDAKI KULLANICI)
  async changeEmail(user: User, changeEmailDto: ChangeEmailDto): Promise<{ message: string }> {
    let { oldMail, newMail } = changeEmailDto;
    oldMail = oldMail.toLowerCase();
    newMail = newMail.toLowerCase();

    this.logger.log(`Email change attempt for user ID: ${user.id}, from: ${oldMail} to: ${newMail}`);

    // Kontroller
    if (oldMail !== user.email) {
      this.logger.warn(`Email change failed - Old email is incorrect for user ID: ${user.id}`);
      throw new BadRequestException('Old email is incorrect');
    }

    if (oldMail === newMail) {
      this.logger.warn(`Email change failed - New email cannot be same as old email for user ID: ${user.id}`);
      throw new BadRequestException('New email cannot be same as old email');
    }

    // New mail zaten kullanılıyor mu?
    const existingUser = await this.userRepository.findOne({ where: { email: newMail } });
    if (existingUser) {
      this.logger.warn(`Email change failed - Email already exists: ${newMail} for user ID: ${user.id}`);
      throw new BadRequestException('Email already exists');
    }

    user.email = newMail.toLowerCase();
    await this.userRepository.save(user);

    this.logger.log(`Email changed successfully for user ID: ${user.id}, new email: ${newMail}`);
    return { message: 'Email changed successfully' };
  }


  // LOGOUT ALL DEVICES
  async logoutAllDevices(user: User): Promise<{ message: string }> {
    this.logger.log(`Logout all devices for user ID: ${user.id}`);
    const result = await this.refreshTokenService.revokeAllTokensByUser(user);
    this.logger.log(`Logout all devices successful for user ID: ${user.id}`);
    return result;
  }

  // FORCE LOGOUT (Çalınmalara karşı)
  async forceLogout(userId: number): Promise<{ message: string }> {
    this.logger.log(`Force logout attempt for user ID: ${userId}`);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`Force logout failed - User not found for ID: ${userId}`);
      throw new NotFoundException('User not found');
    }

    const result = await this.refreshTokenService.revokeAllTokensByUser(user);

    this.logger.log(`Force logout successful for user ID: ${userId}`);
    return result;
  }

}