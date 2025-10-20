import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { StreamService } from './stream.service';

@Controller('stream')
export class StreamController {
    constructor(private readonly streamService: StreamService) { }

    @Get(':type/:id/:seasonNumber?/:episodeNumber?')
    async getStreamUrl(
        @Param('type') type: string,
        @Param('id', ParseIntPipe) id: number,
        @Param('seasonNumber', ParseIntPipe) seasonNumber?: number,
        @Param('episodeNumber', ParseIntPipe) episodeNumber?: number
    ) {
        return this.streamService.getStreamUrl({
            type,
            id,
            seasonNumber,
            episodeNumber
        });
    }
}
