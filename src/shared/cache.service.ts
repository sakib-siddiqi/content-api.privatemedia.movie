import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { Cache } from '../database/models/cache.model';
import { Op } from 'sequelize';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  compress?: boolean;
}

@Injectable()
export class CacheService implements OnModuleInit {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @Inject('SEQUELIZE') private readonly sequelize: any,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      // Test Redis connection
      await this.redis.ping();
      this.logger.log('✅ Redis connection validated');

      // Test database connection
      // await this.sequelize.authenticate();
      // this.logger.log('✅ Database connection validated');
    } catch (error) {
      this.logger.error('❌ Connection validation failed:', error.message);
      throw error;
    }
  }

  /**
   * Get data from cache (Redis first, then DB fallback)
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Try Redis first
      const redisData = await this.redis.get(key);
      if (redisData) {
        this.logger.debug(`Cache hit (Redis): ${key}`);
        return JSON.parse(redisData);
      }

      // Fallback to DB
      const dbCache = await this.sequelize.models.Cache.findOne({
        where: {
          key,
          expires_at: {
            [Op.gt]: new Date(),
          },
        },
      });

      if (dbCache) {
        this.logger.debug(`Cache hit (DB): ${key}`);
        // Also restore to Redis for faster future access
        await this.set(key, dbCache.data, {
          ttl: Math.floor((dbCache.expires_at.getTime() - Date.now()) / 1000),
        });
        return dbCache.data as T;
      }

      this.logger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set data in cache (Redis primary, DB backup)
   */
  async set<T>(
    key: string,
    data: T,
    options: CacheOptions = {},
  ): Promise<void> {
    const { ttl = 3600, compress = false } = options; // Default 1 hour TTL
    const serializedData = JSON.stringify(data);
    const expiresAt = new Date(Date.now() + ttl * 1000);

    try {
      // Set in Redis
      await this.redis.setex(key, ttl, serializedData);
      this.logger.debug(`Cache set (Redis): ${key}`);

      // Also store in DB as backup
      await this.sequelize.models.Cache.upsert({
        key,
        data,
        expires_at: expiresAt,
      });
      this.logger.debug(`Cache set (DB): ${key}`);
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
      // If Redis fails, still try to store in DB
      try {
        await this.sequelize.models.Cache.upsert({
          key,
          data,
          expires_at: expiresAt,
        });
        this.logger.debug(`Cache set (DB fallback): ${key}`);
      } catch (dbError) {
        this.logger.error(`DB cache fallback failed for key ${key}:`, dbError);
      }
    }
  }

  /**
   * Delete data from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await Promise.all([
        this.redis.del(key),
        this.sequelize.models.Cache.destroy({ where: { key } }),
      ]);
      this.logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      await Promise.all([
        this.redis.flushall(),
        this.sequelize.models.Cache.destroy({ where: {} }),
      ]);
      this.logger.debug('Cache cleared');
    } catch (error) {
      this.logger.error('Cache clear error:', error);
    }
  }

  /**
   * Get or set cache with a fetcher function
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    let data = await this.get<T>(key);
    if (data !== null) {
      return data;
    }

    // Fetch fresh data
    data = await fetcher();

    // Cache it
    await this.set(key, data, options);

    return data;
  }

  /**
   * Clean expired entries from DB cache
   */
  async cleanExpired(): Promise<void> {
    try {
      const deletedCount = await this.sequelize.models.Cache.destroy({
        where: {
          expires_at: {
            [Op.lt]: new Date(),
          },
        },
      });
      if (deletedCount > 0) {
        this.logger.debug(`Cleaned ${deletedCount} expired cache entries`);
      }
    } catch (error) {
      this.logger.error('Error cleaning expired cache entries:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    redis: { connected: boolean; db: number };
    db: { total: number; expired: number };
  }> {
    try {
      const [redisInfo, dbTotal, dbExpired] = await Promise.all([
        this.redis.info(),
        this.sequelize.models.Cache.count(),
        this.sequelize.models.Cache.count({
          where: {
            expires_at: {
              [Op.lt]: new Date(),
            },
          },
        }),
      ]);

      const redisConnected = this.redis.status === 'ready';
      const redisDb = parseInt(redisInfo.match(/db\d+:keys=(\d+)/)?.[1] || '0');

      return {
        redis: { connected: redisConnected, db: redisDb },
        db: { total: dbTotal, expired: dbExpired },
      };
    } catch (error) {
      this.logger.error('Error getting cache stats:', error);
      return {
        redis: { connected: false, db: 0 },
        db: { total: 0, expired: 0 },
      };
    }
  }
}
