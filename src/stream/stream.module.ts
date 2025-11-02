import { Module } from '@nestjs/common';
import { StreamService } from './stream.service';
import { StreamController } from './stream.controller';
import { PuppeterService } from 'src/common/services/puppeter.service';

@Module({
  providers: [StreamService, PuppeterService],
  controllers: [StreamController]
})
export class StreamModule {}
