import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '7d';

  @IsString()
  @IsOptional()
  REFRESH_TOKEN_SECRET: string;

  @IsString()
  @IsOptional()
  REFRESH_TOKEN_EXPIRES_IN: string = '30d';

  @IsString()
  @IsOptional()
  API_PREFIX: string = 'api';

  @IsString()
  @IsOptional()
  CORS_ORIGIN: string = 'http://localhost:3000';

  @IsNumber()
  @IsOptional()
  THROTTLE_TTL: number = 60;

  @IsNumber()
  @IsOptional()
  THROTTLE_LIMIT: number = 10;

  @IsNumber()
  @IsOptional()
  MAX_FILE_SIZE: number = 10485760;

  @IsString()
  @IsOptional()
  UPLOAD_PATH: string = './uploads';
}
