import { Controller, Get, Param, ParseIntPipe, Redirect, Res, UseGuards } from '@nestjs/common';
import { StreamService } from './stream.service';
import { Response } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { SubscriberGuard } from 'src/guards/subscriber.guard';

@Controller('stream')
export class StreamController {
    constructor(private readonly streamService: StreamService) { }

    // @Get('/movie/:id')
    // @Redirect()
    // async getMovieStreamUrl(
    //     @Param('id', ParseIntPipe) id: number
    // ) {
    //     const streamUrl = await this.streamService.getStreamUrl({
    //         type: 'movie',
    //         id,
    //     });
    //     return { url: streamUrl, statusCode: 302 };
    // }

    // @Get('/tv-series/:id/:seasonNumber/:episodeNumber')
    // @Redirect()
    // async getTVShowStreamUrl(
    //     @Param('id', ParseIntPipe) id: number,
    //     @Param('seasonNumber', ParseIntPipe) seasonNumber: number,
    //     @Param('episodeNumber', ParseIntPipe) episodeNumber: number
    // ) {
    //     const streamUrl = await this.streamService.getStreamUrl({
    //         type: 'tv-series',
    //         id,
    //         seasonNumber,
    //         episodeNumber
    //     });

    //     return { url: streamUrl, statusCode: 302 };
    // }

    @UseGuards(AuthGuard)
    @UseGuards(SubscriberGuard)
    @Get('/movie/embed/:id')
    async getMovieStreamEmbed(
        @Param('id') id: string
    ) {
        const link = await this.streamService.getMovieStreamEmbed(id);
        console.log(link)
        return {
            url: link,
            statusCode: 200
        }
    }

    @UseGuards(AuthGuard)
    @UseGuards(SubscriberGuard)
    @Get('/tv-series/embed/:id/:seasonNumber/:episodeNumber')
    async getTVShowStreamEmbed(
        @Param('id') id: string,
        @Param('seasonNumber', ParseIntPipe) seasonNumber: number,
        @Param('episodeNumber', ParseIntPipe) episodeNumber: number,
    ) {
        const link = await this.streamService.getTVShowStreamEmbed(id, seasonNumber, episodeNumber);
        return {
            url: link,
            statusCode: 200
        }
    }
}
