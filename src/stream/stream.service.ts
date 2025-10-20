import { BadRequestException, Injectable as NestInjectable } from '@nestjs/common';

@NestInjectable()
export class StreamService {
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
        const url = new URL(`https://player.vidify.top/embed/movie/${id}`);
        url.searchParams.set('autoplay', 'false');
        url.searchParams.set('poster', 'true');
        url.searchParams.set('chromecast', 'true');
        url.searchParams.set('servericon', 'true');
        url.searchParams.set('setting', 'true');
        url.searchParams.set('pip', 'true');
        url.searchParams.set('font', 'Roboto');
        url.searchParams.set('fontcolor', '6f63ff');
        url.searchParams.set('fontsize', '20');
        url.searchParams.set('opacity', '0.5');
        url.searchParams.set('primarycolor', '3b82f6');
        url.searchParams.set('secondarycolor', '1f2937');
        url.searchParams.set('iconcolor', 'ffffff');

        return url.href;
    }

    getTVShowStreamUrl(id: number, seasonNumber: number, episodeNumber: number) {
        const url = new URL(`https://player.vidify.top/embed/tv/${id}/${seasonNumber}/${episodeNumber}`);
        url.searchParams.set('autoplay', 'true');
        url.searchParams.set('poster', 'true');
        url.searchParams.set('chromecast', 'true');
        url.searchParams.set('servericon', 'true');
        url.searchParams.set('setting', 'true');
        url.searchParams.set('pip', 'true');
        url.searchParams.set('logourl', 'https://i.ibb.co/67wTJd9R/pngimg-com-netflix-PNG11.png');
        url.searchParams.set('font', 'Roboto');
        url.searchParams.set('fontcolor', '6f63ff');
        url.searchParams.set('fontsize', '20');
        url.searchParams.set('opacity', '0.5');
        url.searchParams.set('primarycolor', '3b82f6');
        url.searchParams.set('secondarycolor', '1f2937');
        url.searchParams.set('iconcolor', 'ffffff');

        return url.href;
    }
}
