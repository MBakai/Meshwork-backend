import { Exclude } from "class-transformer";
import { IsEmail, IsInt, IsString, IsStrongPassword, MinLength } from "class-validator";


export class CreateUserDto{
    
    @IsString()
    @MinLength(1)
    nombre:string;

    @IsString()
    @IsEmail()
    email: string;

    @IsStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
      }, {
        message: 'La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número.'
      })
    password: string;

    
    @IsString()
    confirmPassword: string;

    @IsInt()
    id_genero: number;
}