import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Permission action (e.g., users:view, documents:*, *)',
    example: 'users:view',
  })
  @IsString()
  action: string;

  @ApiProperty({
    description: 'Resource name',
    example: 'users',
  })
  @IsString()
  resource: string;

  @ApiProperty({
    description: 'Permission description',
    example: 'View user information',
  })
  @IsString()
  description: string;
}
