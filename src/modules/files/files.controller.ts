import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiProperty,
} from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

class CreateFileDto {
  @ApiProperty({ description: 'File name', example: 'report.pdf' })
  @IsString()
  filename: string;

  @ApiProperty({ description: 'MIME type', example: 'application/pdf' })
  @IsString()
  mimeType: string;

  @ApiProperty({ description: 'File size in bytes', example: 102400 })
  @IsNumber()
  size: number;

  @ApiProperty({ description: 'Folder ID', required: false })
  @IsOptional()
  @IsString()
  folderId?: string;
}

@ApiTags('Files')
@ApiBearerAuth('JWT-auth')
@Controller('files')
export class FilesController {
  @Get()
  @ApiOperation({ summary: 'List files' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'folderId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Files retrieved' })
  async findAll(
    @Query('page') page?: number,
    @Query('folderId') folderId?: string,
  ) {
    return {
      data: [
        {
          id: 'file_1',
          filename: 'report.pdf',
          mimeType: 'application/pdf',
          size: 102400,
          folderId,
        },
      ],
      meta: { page: page || 1, limit: 10 },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file detail' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File found' })
  async findOne(@Param('id') id: string) {
    return {
      id,
      filename: 'report.pdf',
      mimeType: 'application/pdf',
      size: 102400,
      downloadUrl: `https://example.com/download/${id}`,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Upload file metadata' })
  @ApiResponse({ status: 201, description: 'File registered' })
  async create(@Body() createFileDto: CreateFileDto) {
    return { id: 'file_new', ...createFileDto };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update file metadata' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File updated' })
  async update(
    @Param('id') id: string,
    @Body() updateFileDto: Partial<CreateFileDto>,
  ) {
    return { id, ...updateFileDto, updatedAt: new Date().toISOString() };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File deleted' })
  async remove(@Param('id') id: string) {
    return { id, deleted: true };
  }
}
