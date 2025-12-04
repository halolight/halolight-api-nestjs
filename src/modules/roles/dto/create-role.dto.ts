import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role name (unique identifier)',
    example: 'admin',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Role display label',
    example: 'Administrator',
  })
  @IsString()
  label: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Full system access',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Array of permission IDs to assign',
    example: ['perm_1', 'perm_2'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  permissionIds?: string[];
}
