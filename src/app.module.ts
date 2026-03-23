import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OptimizationModule } from './modules/optimization/optimization.module';

@Module({
  imports: [OptimizationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
