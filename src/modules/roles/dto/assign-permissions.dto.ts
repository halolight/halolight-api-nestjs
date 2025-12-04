import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class AssignPermissionsDto {
  @ApiProperty({
    description: 'Array of permission IDs to assign to this role',
    example: ['perm_1', 'perm_2', 'perm_3'],
    type: [String],
  })
  @IsArray()
  permissionIds: string[];
}
