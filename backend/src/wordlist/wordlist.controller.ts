import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { WordlistService } from './wordlist.service';

// Multer configuration with 1MB limit
const multerOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB limit
  },
  fileFilter: (
    req: any,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const allowedMimes = ['text/plain', 'text/csv', 'application/csv'];
    const allowedExtensions = ['.txt', '.csv'];
    
    const hasValidExtension = allowedExtensions.some((ext) =>
      file.originalname.toLowerCase().endsWith(ext),
    );

    if (allowedMimes.includes(file.mimetype) || hasValidExtension) {
      callback(null, true);
    } else {
      callback(
        new BadRequestException('Only .txt and .csv files are allowed'),
        false,
      );
    }
  },
};

@Controller('lobbies/:lobbyId/wordlist')
export class WordlistController {
  constructor(private readonly wordlistService: WordlistService) {}

  /**
   * POST /lobbies/:lobbyId/wordlist - Upload a custom wordlist
   */
  @Post()
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadWordlist(
    @Param('lobbyId') lobbyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('uploadedBy') uploadedBy?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const normalizedLobbyId = lobbyId.toUpperCase();
    const uploader = uploadedBy || 'anonymous';

    const wordlist = await this.wordlistService.uploadWordlist(
      normalizedLobbyId,
      file,
      uploader,
    );

    return {
      id: wordlist.id,
      lobbyId: wordlist.lobbyId,
      wordCount: wordlist.words.length,
      uploadedBy: wordlist.uploadedBy,
      uploadedAt: wordlist.uploadedAt,
    };
  }

  /**
   * GET /lobbies/:lobbyId/wordlist - Get current wordlist
   */
  @Get()
  async getWordlist(@Param('lobbyId') lobbyId: string) {
    const normalizedLobbyId = lobbyId.toUpperCase();
    const words = await this.wordlistService.getWordlist(normalizedLobbyId);
    const wordlistEntity = await this.wordlistService.getWordlistEntity(
      normalizedLobbyId,
    );

    return {
      words,
      wordCount: words.length,
      isCustom: !!wordlistEntity,
      uploadedBy: wordlistEntity?.uploadedBy || null,
      uploadedAt: wordlistEntity?.uploadedAt || null,
    };
  }

  /**
   * DELETE /lobbies/:lobbyId/wordlist - Remove custom wordlist
   */
  @Delete()
  async deleteWordlist(@Param('lobbyId') lobbyId: string) {
    const normalizedLobbyId = lobbyId.toUpperCase();
    
    const wordlistEntity = await this.wordlistService.getWordlistEntity(
      normalizedLobbyId,
    );

    if (!wordlistEntity) {
      throw new NotFoundException('No custom wordlist found for this lobby');
    }

    await this.wordlistService.deleteWordlist(normalizedLobbyId);

    return {
      message: 'Wordlist deleted successfully',
      lobbyId: normalizedLobbyId,
    };
  }
}
