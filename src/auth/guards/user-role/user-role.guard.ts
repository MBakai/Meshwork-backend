import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { META_ROLES } from "src/auth/decorators/roles-protected.decorator";
import { User } from "src/auth/entities/user.entity";
import { Repository } from "typeorm";



@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const requiredRoles = this.reflector.get<string[]>(META_ROLES, context.getHandler());
    
    // Si no hay roles requeridos, permite acceso
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Obtener el usuario con sus roles cargados
    const userWithRoles = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['role'],
    });

    if (!userWithRoles) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // obtiene el nombre del rol de usuario
    const userRoleName = userWithRoles.role.rolNombre;

    const hasRequiredRole = requiredRoles.includes(userRoleName);

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `El usuario ${userWithRoles.nombre} no tiene los roles necesarios. ` +
        `Roles requeridos: [${requiredRoles.join(', ')}]`
      );
    }

    return true;
  }
}