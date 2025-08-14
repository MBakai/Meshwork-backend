import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Res, Req, Query} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request as ExpressRequest, Response } from 'express';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateUserDto } from './dto/create.user.dto';
import { LoginUserDto } from './dto/login.user.dto';
import { Auth } from './decorators/auth.decorator';
import { JwtTokenService } from './jwt-token-service/jwt-token.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';

@Controller('user')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtTokenService: JwtTokenService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Post('refresh')
    refresh(@Req() req: ExpressRequest, @Res({ passthrough: true }) res: Response) {
    return this.authService.refreshToken(req, res); 
  }

  @Get()
  @Auth('admin', 'usuario')
  findAll() {
    return this.authService.findAll();
  }

  @Get('get-user/:uuid')
  findById(@Param('uuid', ParseUUIDPipe) id: string){
      return this.authService.findById(id)
    }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto, 
        @Res({ passthrough: true }) res: Response) {
    return this.authService.login(loginUserDto, res);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    this.jwtTokenService.clearRefreshTokenCookie(res);
    return { message: 'Sesión cerrada' };
  }

  @Patch('edit-user/:id')
    @Auth('admin','usuario')
    userUpdate(
      @GetUser() user: User,
      @Body() updateAuthkDto: UpdateAuthDto) {
        return this.authService.updateUser(user.id, updateAuthkDto);
    }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }

  @Post('forgot-password')
  requestPassword(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Get('verify-token')
  verifyToken(@Query('token') token: string) {
    return this.authService.verifyResetToken(token);
  }

  @Post('reset-password')
  changePassword(@Body() resetPassword: ResetPasswordDto){
    return this.authService.resetPassword(resetPassword);
  }

  @Post('create-admin')
  createAdmin(@Body() createUserDto: CreateUserDto) {
    return this.authService.createAdmin(createUserDto);
  }
}
