import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    tenantId: string;
    email: string;
  };
}

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: RequestWithUser,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return await this.mediaService.uploadMedia(file, req.user.tenantId);
  }

  @Post('upload/:folder')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileToFolder(
    @UploadedFile() file: Express.Multer.File,
    @Param('folder') folder: string,
    @Request() req: RequestWithUser,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return await this.mediaService.uploadMedia(file, req.user.tenantId, folder);
  }

  @Delete(':key')
  async deleteFile(@Param('key') key: string) {
    await this.mediaService.deleteMedia(key);
    return { message: 'File deleted successfully' };
  }
}