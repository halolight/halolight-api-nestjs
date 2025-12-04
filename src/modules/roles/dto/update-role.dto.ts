import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Role display label',
    example: 'Super Administrator',
    required: false,
  })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Full system access with audit capabilities',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
