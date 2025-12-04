import { Module } from '@nestjs/common';
import { FoldersController } from './folders.controller';

@Module({
  controllers: [FoldersController],
})
export class FoldersModule {}
