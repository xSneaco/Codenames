import { IsNotEmpty, IsString, Matches, IsBoolean, IsOptional } from 'class-validator';

export class GetGameStateDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z0-9]{6}$/, {
    message: 'lobbyId must be a 6-character alphanumeric string',
  })
  lobbyId!: string;

  @IsOptional()
  @IsBoolean()
  isSpymaster?: boolean;
}

export interface GameStateResponseDto {
  words: string[];
  wordColors: Record<string, string>;
  revealedWords: string[];
  currentTurn: 'red' | 'blue';
  status: 'in_progress' | 'finished';
  scores: {
    red: number;
    blue: number;
  };
  startingTeam: 'red' | 'blue';
  winner?: 'red' | 'blue';
}

export class EndTurnDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z0-9]{6}$/, {
    message: 'lobbyId must be a 6-character alphanumeric string',
  })
  lobbyId!: string;
}

export class NewGameDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z0-9]{6}$/, {
    message: 'lobbyId must be a 6-character alphanumeric string',
  })
  lobbyId!: string;
}
