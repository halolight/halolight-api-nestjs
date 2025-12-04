import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Document title', example: 'Project Plan' })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Document content',
    example: '# Heading\nContent',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Folder ID',
    required: false,
    example: 'folder_123',
  })
  @IsOptional()
  @IsString()
  folderId?: string;

  @ApiProperty({ description: 'Tags', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];
}
