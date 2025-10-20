import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { SharedModule } from './shared/shared.module';
import { MoviesModule } from './movies/movies.module';
import { TVShowsModule } from './tv-shows/tv-shows.module';
import { SearchModule } from './search/search.module';
import { TrendingModule } from './trending/trending.module';
import { TcpModule } from './tcp/tcp.module';
import { GuardsModule } from './guards/guards.module';
import { ContentModule } from './content/content.module';
import { StreamModule } from './stream/stream.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    DatabaseModule,
    RedisModule,
    SharedModule,
    MoviesModule,
    TVShowsModule,
    SearchModule,
    TrendingModule,
    TcpModule,
    GuardsModule,
    ContentModule,
    StreamModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
