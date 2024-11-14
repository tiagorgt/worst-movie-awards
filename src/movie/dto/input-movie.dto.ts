import {
  IsBoolean,
  IsInt,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class InputMovieDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsInt()
  @IsPositive()
  year: number;

  @IsString()
  @MaxLength(255)
  producers: string;

  @IsBoolean()
  winner: boolean;

  @IsString()
  @MaxLength(255)
  studios: string;
}
