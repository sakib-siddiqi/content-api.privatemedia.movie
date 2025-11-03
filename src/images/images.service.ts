import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import { SupabaseStorageService } from 'src/supabase/supabaseStorage.service';

@Injectable()
export class ImagesService {
    constructor(
        private readonly supabaseStorageService: SupabaseStorageService,
        @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
    ) { }

    async getTmdbImage(fileName: string): Promise<Buffer> {
        const response = await axios.get(`https://image.tmdb.org/t/p/original/${fileName}`, {
            responseType: 'arraybuffer', // important
            headers: {
                'content-type': 'image/jpeg'
            }
        });
        return response.data;
    }

    async uploadMovieSiteImage(fileName: string) {
        try {
            const fileBuffer = await this.getTmdbImage(fileName);
            await this.supabaseStorageService.uploadFile(
                SupabaseStorageService.BUCKETS.movieSiteImages,
                fileName,
                fileBuffer,
                'image/jpeg'
            );
            const publicUrl = await this.supabase.storage.from(SupabaseStorageService.BUCKETS.movieSiteImages).getPublicUrl(fileName);
            return publicUrl.data.publicUrl;
        } catch (error) {
            return null;
        }
    }
}
