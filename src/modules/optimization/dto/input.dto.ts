import { IsString, IsNotEmpty, IsPositive, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CargoDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsPositive()
  volume: number;
}

export class TankDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsPositive()
  capacity: number;
}

export class OptimizeInputDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CargoDto)
  cargos: CargoDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TankDto)
  tanks: TankDto[];
}
