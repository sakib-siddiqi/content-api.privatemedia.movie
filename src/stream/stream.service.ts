import { BadRequestException, Injectable as NestInjectable } from '@nestjs/common';
import axios from 'axios';
import { PuppeterService } from 'src/common/services/puppeter.service';

@NestInjectable()
export class StreamService {
    constructor(private readonly puppeterService: PuppeterService) { }
    static ACCESS_KEY = 'os44dzy5gudl92lj';
    static BASE_URL = 'https://embedmaster.link/';
    static BASE_PLAYER = 'https://embdmstrplayer.com/';
    async getStreamUrl(query: { type?: string; id?: number | string, seasonNumber?: number, episodeNumber?: number }) {
        const { type, id } = query;

        if (!type || !id) {
            return {
                status: 400,
                message: 'Missing type or id',
            };
        }

        switch (type) {
            case 'movie':
                return this.getMovieStreamUrl(Number(id));
            case 'tv-series':
                return this.getTVShowStreamUrl(Number(id), Number(query.seasonNumber || 1), Number(query.episodeNumber || 1));
            default:
                throw new BadRequestException('Invalid type');
        }

    }

    getMovieStreamUrl(id: number) {
        const url = new URL(`https://embedmaster.link/${StreamService.ACCESS_KEY}/movie/${id}`);
        return url.href;
    }

    getTVShowStreamUrl(id: number, seasonNumber: number, episodeNumber: number) {
        const url = new URL(`https://embedmaster.link/${StreamService.ACCESS_KEY}/tv/${id}/${seasonNumber}/${episodeNumber}`);
        return url.href;
    }

    async getMovieStreamEmbed(id: string) {
        try {
            const url = new URL(`${StreamService.BASE_URL}${StreamService.ACCESS_KEY}/movie/${id}`);
            const response = await axios.get(url.href);
            const embedUrl = await this.puppeterService.getEmbedMasterUrl(response.data);
            const fullUrl = new URL(StreamService.BASE_PLAYER);
            fullUrl.pathname = embedUrl || '';
            return fullUrl.href;
        } catch (error) {
            console.log(error)
        }
    }

    async getTVShowStreamEmbed(id: string, seasonNumber: number, episodeNumber: number) {
        const url = new URL(`${StreamService.BASE_URL}${StreamService.ACCESS_KEY}/tv/${id}/${seasonNumber}/${episodeNumber}`);
        const response = await axios.get(url.href);
        const embedUrl = await this.puppeterService.getEmbedMasterUrl(response.data);
        const fullUrl = new URL(StreamService.BASE_PLAYER);
        fullUrl.pathname = embedUrl || '';
        return fullUrl.href;
    }
}
