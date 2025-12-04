import { Controller, Get, Header } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Header('Content-Type', 'text/html')
  @ApiExcludeEndpoint()
  getHomePage(): string {
    return this.appService.getHomePage();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns API status and version information',
  })
  @ApiResponse({
    status: 200,
    description: 'API is running',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'HaloLight API' },
        version: { type: 'string', example: '1.0.0' },
        environment: { type: 'string', example: 'development' },
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-12-04T12:00:00.000Z' },
      },
    },
  })
  getHello(): object {
    return this.appService.getHello();
  }
}
