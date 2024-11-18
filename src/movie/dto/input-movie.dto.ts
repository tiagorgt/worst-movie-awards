import {
  ArrayNotEmpty,
  IsArray,
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

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  producerIds: number[];

  @IsBoolean()
  winner: boolean;

  @IsString()
  @MaxLength(255)
  studios: string;
}
