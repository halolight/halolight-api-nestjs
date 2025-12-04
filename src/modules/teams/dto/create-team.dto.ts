import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({
    description: 'Team name',
    example: 'Engineering Team',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Team description',
    example: 'Core engineering team',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Team avatar URL',
    example: 'https://example.com/team-avatar.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    description: 'Array of user IDs to add as members',
    example: ['user_1', 'user_2'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  memberIds?: string[];
}
