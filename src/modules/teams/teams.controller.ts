import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTeamDto } from './dto/create-team.dto';

export class UpdateTeamDto {
  name?: string;
  description?: string;
  avatar?: string;
}

@ApiTags('Teams')
@ApiBearerAuth('JWT-auth')
@Controller('teams')
export class TeamsController {
  @Get()
  @ApiOperation({
    summary: 'List teams',
    description: 'Retrieve paginated teams with optional search.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Teams retrieved successfully',
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') _search?: string,
  ) {
    return {
      data: [
        {
          id: 'team_1',
          name: 'Engineering Team',
          description: 'Core platform team',
          members: 12,
        },
        {
          id: 'team_2',
          name: 'Product Team',
          description: 'Product strategy and design',
          members: 8,
        },
      ],
      meta: {
        page: page || 1,
        limit: limit || 10,
        total: 2,
      },
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get team detail',
    description: 'Retrieve details of a team by ID.',
  })
  @ApiParam({ name: 'id', description: 'Team ID', example: 'team_1' })
  @ApiResponse({ status: 200, description: 'Team found' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async findOne(@Param('id') id: string) {
    return {
      id,
      name: 'Engineering Team',
      description: 'Core platform team',
      members: [
        { id: 'user_1', name: 'Alice' },
        { id: 'user_2', name: 'Bob' },
      ],
      createdAt: new Date().toISOString(),
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Create team',
    description: 'Create a new team with optional members.',
  })
  @ApiResponse({ status: 201, description: 'Team created' })
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  async create(@Body() createTeamDto: CreateTeamDto) {
    return {
      id: 'team_new',
      name: createTeamDto.name,
      description: createTeamDto.description || null,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update team',
    description: 'Update team details.',
  })
  @ApiParam({ name: 'id', description: 'Team ID', example: 'team_1' })
  @ApiResponse({ status: 200, description: 'Team updated' })
  async update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    return {
      id,
      ...updateTeamDto,
      updatedAt: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete team',
    description: 'Remove a team by ID.',
  })
  @ApiParam({ name: 'id', description: 'Team ID', example: 'team_1' })
  @ApiResponse({ status: 200, description: 'Team deleted' })
  async remove(@Param('id') id: string) {
    return { id, deleted: true };
  }
}
