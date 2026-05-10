import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { beforeAll, afterAll, describe, expect, it, jest } from '@jest/globals';

// E2E tests — run against a real database (use a separate test DB)
// Set TEST_DB_DATABASE=db_save_money_test in your .env.test
describe('Users (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/login — should return a JWT token', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'vega178', password: 'your_password_here' })
      .expect(200);

    expect(response.body.token).toBeDefined();
    jwtToken = response.body.token;
  });

  it('GET /api/users — public, should return users list', async () => {
    await request(app.getHttpServer()).get('/api/users').expect(200);
  });

  it('GET /api/users/:id — should require JWT', async () => {
    await request(app.getHttpServer()).get('/api/users/1').expect(401);
  });

  it('GET /api/users/:id — should return user when JWT is provided', async () => {
    if (!jwtToken) return; // skip if login failed
    const response = await request(app.getHttpServer())
      .get('/api/users/1')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(response.body.username).toBeDefined();
    expect(response.body.password).toBeUndefined();
  });
});
