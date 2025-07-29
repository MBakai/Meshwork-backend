import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from '../entities/user.entity';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from "jsonwebtoken";


@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy){

    constructor(

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        configService: ConfigService
    ){

        super({
            jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('JWT_ACCESS_SECRET')!,
            ignoreExpiration:false
        });
    }

    async validate( payload: JwtPayload ): Promise<User> {

        const user = await this.userRepository.findOneBy({ id: payload.sub });

        if(!user)
            throw new UnauthorizedException('Token not valid!!!');

        if(!user.activo)
            throw new UnauthorizedException('El usuario ya no esta activo!!');
        
        return user;

    }

}

