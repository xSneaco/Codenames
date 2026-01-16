import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class RevealWordDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z0-9]{6}$/, {
    message: 'lobbyId must be a 6-character alphanumeric string',
  })
  lobbyId!: string;

  @IsNotEmpty()
  @IsString()
  word!: string;
}
