import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Optimization API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('System E2E flow: Input -> Optimize -> Results', async () => {
    // 1. Post Input
    const inputPayload = {
      cargos: [
        { id: 'C1', volume: 1000 },
        { id: 'C2', volume: 500 }
      ],
      tanks: [
        { id: 'T1', capacity: 1200 },
        { id: 'T2', capacity: 600 }
      ]
    };

    const inputResponse = await request(app.getHttpServer())
      .post('/input')
      .send(inputPayload)
      .expect(200);
    
    expect(inputResponse.body.message).toBe('Input loaded successfully');

    // 2. Post Optimize
    const optimizeResponse = await request(app.getHttpServer())
      .post('/optimize')
      .expect(200);

    expect(optimizeResponse.body.message).toBe('Optimization completed');

    // 3. Get Results
    const resultsResponse = await request(app.getHttpServer())
      .get('/results')
      .expect(200);

    expect(resultsResponse.body.totalLoaded).toBe(1500);
    expect(resultsResponse.body.allocations).toEqual(
      expect.arrayContaining([
        { cargoId: 'C1', tankId: 'T1', allocatedVolume: 1000 },
        { cargoId: 'C2', tankId: 'T2', allocatedVolume: 500 }
      ])
    );
  });
});
