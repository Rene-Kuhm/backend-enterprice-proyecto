import { Controller, Get, Post, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FilesService } from './files.service';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  upload() {
    // TODO: Implement file upload with multer
    return { message: 'File upload endpoint - to be implemented with multer' };
  }

  @Get()
  @ApiOperation({ summary: 'Get all files' })
  findAll(@Query('userId') userId?: string) {
    return this.filesService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID' })
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file' })
  remove(@Param('id') id: string) {
    return this.filesService.remove(id);
  }
}
