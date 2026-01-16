import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLobbyDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  hostName?: string;
}
