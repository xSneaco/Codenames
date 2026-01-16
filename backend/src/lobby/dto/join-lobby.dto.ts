import { IsNotEmpty, IsString, MaxLength, Matches } from 'class-validator';

export class JoinLobbyDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z0-9]{6}$/, {
    message: 'lobbyId must be a 6-character alphanumeric string',
  })
  lobbyId!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  playerName!: string;
}
