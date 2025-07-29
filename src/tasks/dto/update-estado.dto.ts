import { IsInt, IsNotEmpty } from "class-validator";

export class UpdateStatusDto {
  @IsInt()
  @IsNotEmpty()
  estadoId: number;
}