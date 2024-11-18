import { IsString, MaxLength } from 'class-validator';

export class InputProducerDto {
  @IsString()
  @MaxLength(255)
  name: string;
}
