import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class InputMovieDto {
  @IsString()
  title: string;

  @IsNumber()
  year: number;

  @IsString()
  producers: string;

  @IsBoolean()
  winner: boolean;

  @IsString()
  studios: string;
}
