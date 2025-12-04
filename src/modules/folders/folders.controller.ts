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
import { IsOptional, IsString } from 'class-validator';

class CreateFolderDto {
  @ApiProperty({ description: 'Folder name', example: 'Design Docs' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Parent folder ID', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;
}

@ApiTags('Folders')
@ApiBearerAuth('JWT-auth')
@Controller('folders')
export class FoldersController {
  @Get()
  @ApiOperation({ summary: 'List folders' })
  @ApiQuery({ name: 'parentId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Folders retrieved' })
  async findAll(@Query('parentId') parentId?: string) {
    return [
      { id: 'folder_root', name: 'Root', parentId: null },
      {
        id: 'folder_123',
        name: 'Design Docs',
        parentId: parentId || 'folder_root',
      },
    ];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get folder detail' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiResponse({ status: 200, description: 'Folder found' })
  async findOne(@Param('id') id: string) {
    return {
      id,
      name: 'Design Docs',
      parentId: 'folder_root',
      createdAt: new Date().toISOString(),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create folder' })
  @ApiResponse({ status: 201, description: 'Folder created' })
  async create(@Body() createFolderDto: CreateFolderDto) {
    return { id: 'folder_new', ...createFolderDto };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update folder' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiResponse({ status: 200, description: 'Folder updated' })
  async update(
    @Param('id') id: string,
    @Body() updateFolderDto: Partial<CreateFolderDto>,
  ) {
    return { id, ...updateFolderDto, updatedAt: new Date().toISOString() };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete folder' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiResponse({ status: 200, description: 'Folder deleted' })
  async remove(@Param('id') id: string) {
    return { id, deleted: true };
  }
}
