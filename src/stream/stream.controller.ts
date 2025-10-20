import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { StreamService } from './stream.service';

@Controller('stream')
export class StreamController {
    constructor(private readonly streamService: StreamService) { }

    @Get('/movie/:id')
    async getMovieStreamUrl(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.streamService.getStreamUrl({
            type: 'movie',
            id,
        });
    }

    @Get('/tv-series/:id/:seasonNumber/:episodeNumber')
    async getTVShowStreamUrl(
        @Param('id', ParseIntPipe) id: number,
        @Param('seasonNumber', ParseIntPipe) seasonNumber: number,
        @Param('episodeNumber', ParseIntPipe) episodeNumber: number
    ) {
        return this.streamService.getStreamUrl({
            type: 'tv-series',
            id,
            seasonNumber,
            episodeNumber
        });
    }
}
