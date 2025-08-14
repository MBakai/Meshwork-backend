import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateUserDto } from './dto/create.user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login.user.dto';
import { Genero } from 'src/genero/entities/genero.entitys';
import { Roles } from 'src/roles/entities/roles.entity';
import { Colaborador } from 'src/colaboradores/entities/colaborador.entity';
import { NodemailerService } from 'src/services/nodemailer/nodemailer.service';
import { SendEmail } from 'src/send-email/entities/send-email.entity';
import { ErrorCodes } from './entities/error.codes.enum';
import { JwtTokenService } from './jwt-token-service/jwt-token.service';
import { JwtPayload } from './interface/jwt.payload.interface';
import { Response, Request } from 'express';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { error } from 'console';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(SendEmail)
    private readonly sendEmailRepository: Repository<SendEmail>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
    
    @InjectRepository(Genero)
    private readonly generoRepository: Repository<Genero>,

    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,

    private readonly nodemailerService: NodemailerService,

    private readonly jwtTokenService: JwtTokenService,

  ){}

  // ════════════════════════════════════════════════
  // 🧪 FUNC: crear usuario administrador con jwt
  // ════════════════════════════════════════════════
  async createUser(createUserDto: CreateUserDto) {
    const { password, confirmPassword, email, nombre, id_genero } = createUserDto;

    // Validar duplicado de email
    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException({
        code: ErrorCodes.EMAIL_ALREADY_REGISTERED,
        message: 'El correo ya está registrado',
      });
    }

    // Validar contraseñas
    if (password !== confirmPassword) {
      throw new BadRequestException({
        code: ErrorCodes.PASSWOR_NOT_MATCH,
        message: 'Las contraseñas no coinciden'
      });
    }

    // Validar género
    const genero = await this.generoRepository.findOneBy({ id: id_genero });
    if (!genero) {
      throw new NotFoundException({
        code: ErrorCodes.RESOURCE_NOT_FOUND_GENDER,
        message: 'Género no encontrado'
      });
    }

    // Validar rol
    const verRole = await this.rolesRepository.findOneBy({ rolNombre: 'usuario' });
    if (!verRole) {
      throw new NotFoundException({
        code: ErrorCodes.RESOURCE_NOT_FOUND_ROL,
        message: 'Rol no encontrado'
      });
    }

    // Crear usuario
    const nuevoUsuario = this.userRepository.create({
      nombre,
      email,
      password: bcrypt.hashSync(password, 10),
      genero,
      role: verRole,
    });
    await this.userRepository.save(nuevoUsuario);

    // Crear token de verificación
    const verificationToken = uuidv4();
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

    const userVerification = this.sendEmailRepository.create({
      token: verificationToken,
      expiresAt: verificationTokenExpires,
      used: false,
      type: 'EMAIL',
      user: nuevoUsuario,
    });
    await this.sendEmailRepository.save(userVerification);

    // Enviar email de verificación
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-account?token=${verificationToken}`;
    await this.nodemailerService.sendVerificationEmail(email, nombre, verificationUrl);

    return { message: 'Usuario registrado. Por favor verifica tu email.' };
  }


  // ════════════════════════════════════════════════
  // 🧪 FUNC: recuperacion de contraseña
  // ════════════════════════════════════════════════
  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado con ese email.');
    }

    const resetToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hora de validez

    const tokenEntity = this.sendEmailRepository.create({
      token: resetToken,
      expiresAt,
      used: false,
      type: 'PASSWORD_RESET',
      user,
    });

    await this.sendEmailRepository.save(tokenEntity);

    const resetUrl = `${process.env.FRONTEND_URL}/recovery-password?token=${resetToken}`;

    await this.nodemailerService.sendPasswordRecoveryEmail(user.email, user.nombre, resetUrl);

    return { message: 'Correo de recuperación enviado.' };
  }

  async verifyResetToken(token: string) {

    const tokenRecord = await this.sendEmailRepository.findOne({
      where: { token, type: 'PASSWORD_RESET', used: false },
      relations: ['user'],
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Token inválido o expirado.');
    }

    return { valid: true };
  }

  async resetPassword(resetPassword: ResetPasswordDto) {

    const {token, newPassword} = resetPassword;

    const tokenRecord = await this.sendEmailRepository.findOne({
      where: { token, type: 'PASSWORD_RESET', used: false },
      relations: ['user'],
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Token inválido o expirado.');
    }

    const user = tokenRecord.user;
    user.password = bcrypt.hashSync(newPassword, 10);

    await this.userRepository.save(user);

    // Invalida el token
    tokenRecord.used = true;
    await this.sendEmailRepository.save(tokenRecord);

    return { message: 'Contraseña actualizada correctamente.' };

  }

  
  // ════════════════════════════════════════════════
  // 🧪 FUNC: Obtener a todos los usuarios
  // ════════════════════════════════════════════════
  async findAll() {
    const datos = await this.userRepository.find({
      select:[
        'id',
        'nombre',
        'email',
      ]
    });

    return datos;
  }


  // ════════════════════════════════════════════════
  // 🧪 FUNC: Obtener usuario por ID  y token
  // ════════════════════════════════════════════════
  async findById(id: string) {
    // Primero buscamos el usuario solicitado
    const usuario = await this.userRepository.findOne({
      where: { id },
      relations: { genero: true }
    });
  
    if (!usuario) {
      throw new NotFoundException(`El usuario con el id ${id} no se encontró`);
    }
    return {
      ...usuario 
    }
  }


  // ════════════════════════════════════════════════
  // 🧪 FUNC: Login de usuario 
  // ════════════════════════════════════════════════
  async login(LoginUserDto: LoginUserDto, res: Response) {

    const { email, password } = LoginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      relations:['genero'],
      select: [ 'id','email','nombre','genero','password', 'activo', 'role']
    });

    if(!user || !bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException({
        Code: ErrorCodes.INVALID_CREDENTIALS,
        message: 'Credenciales Incorrectas'
      });

    // Validar si el usuario está activo
    if (!user.activo) {
      throw new UnauthorizedException({
        Code: ErrorCodes.ACCOUNT_DISABLED,
        message:'El usuario ya no está activo!!'
      });
    }

    const verification = await this.sendEmailRepository.findOne({
      where: {
        user: {id: user.id},
        type: 'EMAIL',
        used: true
      }
    });

    if (!verification) {
      throw new UnauthorizedException({
        Code: ErrorCodes.ACCOUNT_NOT_VERIFIED,
        message:'Cuenta no verificada. Por favor registrate'
      });
    }

    // Generar token (sin incluir la contraseña)
    const tokens = this.getJwtToken({ id: user.id, });

    this.jwtTokenService.setRefreshTokenCookie(res, (await tokens).refreshToken);

    return {
      user:{
        id: user.id,
        name: user.nombre,
        email: user.email,
        genero: user.genero.nombre,
        isActive: user.activo,
        role: user.role.rolNombre
        
      },  // Access token (corto)
      access_token: (await tokens).accessToken,
    };
  }

  async updateUser(userId: string, updateAuthDto: UpdateAuthDto) {
    
     const user = await this.findById(userId);

      Object.assign(user, {
      ...(updateAuthDto.nombre !== undefined && { nombre: updateAuthDto.nombre }),
    });

    const updatedTask = await this.userRepository.save(user);

    const { id, nombre, email } = updatedTask;
    return { id, nombre, email };
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }


  // ════════════════════════════════════════════════
  // 🧪 FUNC: Generar el Access_token y el refresh_token
  // ════════════════════════════════════════════════ 
  async getJwtToken(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtTokenService.signAccessToken({ sub: payload.id }),
      this.jwtTokenService.signRefreshToken({ sub: payload.id }),
    ]);

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update({ id: payload.id }, { refresh_token: hashedRefresh });

    return { accessToken, refreshToken };
  }


  // ════════════════════════════════════════════════
  // 🧪 FUNC: RefreshToken
  // ════════════════════════════════════════════════  
  async refreshToken(req: Request, res: Response) {

    let payload: any;

    console.log('cookies:', req.cookies);

    const refreshToken = req.cookies?.['refresh_token'];
    
    if (!refreshToken) 
      throw new UnauthorizedException('No hay refresh token');

    try {

       payload = this.jwtTokenService.verifyRefreshToken(refreshToken);
    
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      select: ['id', 'refresh_token']
    });

    if (!user || !user.refresh_token) {
      throw new UnauthorizedException('Usuario no válido o sin token de refresco');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refresh_token);
    if (!isMatch) {
      throw new UnauthorizedException('Refresh token no coincide');
    }

    // Usar JwtTokenService para generar nuevos tokens
    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.jwtTokenService.signAccessToken({ sub: user.id }),
      this.jwtTokenService.signRefreshToken({ sub: user.id }),
    ]);

    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await this.userRepository.update(
      { id: user.id },
      { refresh_token: hashedNewRefreshToken }
    );

     // Actualizar cookie
    this.jwtTokenService.setRefreshTokenCookie(res, newRefreshToken);

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken
    };
  }


  private handleDBErrors(error: any): never{
    if(error.code === '23505')
      throw new BadRequestException( error.detail );

    console.log(error);

    throw new InternalServerErrorException('Please check server logs');
    
  }


  // ════════════════════════════════════════════════
  // 🧪 FUNC: crear usuario administrador con jwt
  // ════════════════════════════════════════════════
  async createAdmin(createUserDto: CreateUserDto) {

    try {
      
      const { password, confirmPassword, email, nombre } = createUserDto;
      //desestructuracion de argumentos, separa id_genero del resto de argumentos
  
      const genero = await this.generoRepository.findOneBy({id: createUserDto.id_genero});

      const role = await this.rolesRepository.findOneBy({ rolNombre: 'admin' })

      if(password !== confirmPassword)
        throw new BadRequestException('Las contraseñas no coinciden!!')
      
      if(!genero)
        throw new NotFoundException('Genero no encontrado!!');

      if (!role) {
        throw new NotFoundException('¡Rol no encontrado!');
      }
  
      const nuevoUsuario = this.userRepository.create({
        nombre,
        email,
        password: bcrypt.hashSync(password, 10),
        genero, 
        role // aqui tengo el error
      });

      console.log(nuevoUsuario);
      
      await this.userRepository.save(nuevoUsuario);
      
      //Genera un token 
      const token = this.getJwtToken({ id: nuevoUsuario.id});
      

      return {
        ...nuevoUsuario,
        token //devuelve el token
  
      };
    } catch (error) {

      this.handleDBErrors(error);
    }
  }

}
