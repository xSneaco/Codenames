import { IsNotEmpty, IsString, Matches, IsInt, Min, Max } from 'class-validator';

export class GiveHintDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z0-9]{6}$/i, {
    message: 'lobbyId must be a 6-character alphanumeric string',
  })
  lobbyId!: string;

  @IsNotEmpty()
  @IsString()
  hint!: string;

  @IsNotEmpty()
  @IsInt({ message: 'number must be an integer' })
  @Min(0, { message: 'number must be at least 0' })
  @Max(9, { message: 'number must be at most 9' })
  number!: number;
}
