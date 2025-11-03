import { Controller, Get, Param, Redirect } from '@nestjs/common';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) { }

  @Redirect()
  @Get('pm-movie/:fileName')
  async getTmdbImage(@Param('fileName') fileName: string) {
    const url = await this.imagesService.uploadMovieSiteImage(fileName);
    return {
      url: url,
      statusCode: 302,
    }
  }
}
