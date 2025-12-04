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
} from '@nestjs/swagger';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@ApiTags('Documents')
@ApiBearerAuth('JWT-auth')
@Controller('documents')
export class DocumentsController {
  @Get()
  @ApiOperation({ summary: 'List documents' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Documents retrieved' })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return {
      data: [
        {
          id: 'doc_1',
          title: 'Project Plan',
          folderId: 'folder_123',
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'doc_2',
          title: 'Meeting Notes',
          folderId: null,
          updatedAt: new Date().toISOString(),
        },
      ],
      meta: { page: page || 1, limit: limit || 10, total: 2 },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document detail' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document found' })
  async findOne(@Param('id') id: string) {
    return {
      id,
      title: 'Project Plan',
      content: '# Mock content',
      createdAt: new Date().toISOString(),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create document' })
  @ApiResponse({ status: 201, description: 'Document created' })
  async create(@Body() createDocumentDto: CreateDocumentDto) {
    return { id: 'doc_new', ...createDocumentDto };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document updated' })
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return { id, ...updateDocumentDto, updatedAt: new Date().toISOString() };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 200, description: 'Document deleted' })
  async remove(@Param('id') id: string) {
    return { id, deleted: true };
  }
}
