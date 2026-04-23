import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [NotificationServiceController],
  providers: [NotificationServiceService],
})
export class NotificationServiceModule {}
