import { Injectable } from '@nestjs/common';
import { RedisService } from 'libs/redis';

interface VerifyCodeData {
  email: string;
  code: string;
  attempts: number;
}

@Injectable()
export class EmailVerificationService {
  private readonly ttl: number = 60;

  constructor(private readonly redisService: RedisService) {}

  private getKey(userId: string): string {
    return `auth:verify-email:${userId}`;
  }

  async saveCode(input: {
    userId: string;
    email: string;
    code: string;
  }): Promise<void> {
    await this.redisService.setJson(
      this.getKey(input.userId),
      {
        email: input.email,
        code: input.code,
        attempts: 0,
      },
      this.ttl,
    );
  }

  async verifyCode(input: { userId: string; code: string }): Promise<boolean> {
    const key = this.getKey(input.userId);
    const data = await this.redisService.getJson<VerifyCodeData>(key);

    if (!data) return false;

    if (data.code !== input.code) {
      data.attempts += 1;
      await this.redisService.setJson(key, data, this.ttl);
      return false;
    }

    await this.redisService.del(key);
    return true;
  }
}
