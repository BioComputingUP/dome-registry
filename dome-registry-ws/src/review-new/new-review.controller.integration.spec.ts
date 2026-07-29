import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ReviewNewController } from './new-review.controller';
import { ReviewNewService } from './new-review.service';
import { CreateReviewNewDto } from './dto/create-review-new.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../user/user.decorator';

describe('ReviewNewController - POST Integration Test', () => {
  let app: INestApplication;
  let reviewNewService: ReviewNewService;

  const mockUser = {
    _id: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    orcid: '0000-0001-2345-6789',
    roles: 'user',
  };

  const testReviewData: CreateReviewNewDto = {
    publication: {
      pmid: '12345678',
      doi: '10.1234/test',
      title: 'Test Publication',
      year: 2024,
      journal: 'Test Journal',
      volume: '1',
      issue: '1',
      pages: '1-10',
      authors: ['Author 1', 'Author 2'],
    } as any,
    data: {
      data_availability: 'available',
      data_location: 'https://example.com/data',
      data_type: 'experimental',
      description: 'Test data description',
    } as any,
    optimization: {
      optimization_status: 'completed',
      optimization_type: 'parameter_tuning',
      optimization_method: 'Grid search',
    } as any,
    model: {
      model_type: 'neural_network',
      model_availability: 'available',
      model_location: 'https://example.com/model',
      framework: 'TensorFlow',
    } as any,
    evaluation: {
      evaluation_type: 'cross_validation',
      evaluation_metrics: 'accuracy, precision, recall',
      result: 'Excellent performance',
    } as any,
  };

  const mockServiceResponse = {
    review: {
      _id: 'review123',
      uuid: 'uuid-123-456',
      shortid: 'abc123456',
      ...testReviewData,
      user: mockUser._id,
      public: false,
      created: Date.now(),
      updated: Date.now(),
    },
    callback: async () => {
      return Promise.resolve(undefined);
    },
  };

  beforeAll(async () => {
    const mockReviewService = {
      create: jest.fn().mockResolvedValue(mockServiceResponse),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
      verify: jest.fn().mockReturnValue({ _id: mockUser._id }),
      decode: jest.fn().mockReturnValue({ _id: mockUser._id, orcid: mockUser.orcid }),
    };

    const mockUserService = {
      findByOrcid: jest.fn().mockResolvedValue(mockUser),
    };

    const mockEventEmitter = {
      emitAsync: jest.fn().mockResolvedValue([]),
    };

    // Create a custom interceptor that injects the user
    const userInterceptorMock = {
      intercept: (context, next) => {
        const request = context.switchToHttp().getRequest();
        request.user = mockUser;
        return next.handle();
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ReviewNewController],
      providers: [
        {
          provide: ReviewNewService,
          useValue: mockReviewService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    })
      .overrideGuard('JwtAuthGuard')
      .useValue({})
      .overrideInterceptor('UserInterceptor')
      .useValue(userInterceptorMock)
      .compile();

    app = moduleFixture.createNestApplication();
    reviewNewService = moduleFixture.get<ReviewNewService>(ReviewNewService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    const freshResponse = {
      review: {
        _id: 'review123',
        uuid: 'uuid-123-456',
        shortid: 'abc123456',
        publication: { title: 'Test Publication', pmid: '12345678', doi: '10.1234/test', year: 2024 },
        data: { data_availability: 'available', data_location: 'https://example.com/data' },
        optimization: { optimization_status: 'completed', optimization_type: 'parameter_tuning' },
        model: { model_type: 'neural_network', framework: 'TensorFlow' },
        evaluation: { evaluation_type: 'cross_validation', evaluation_metrics: 'accuracy, precision' },
        user: mockUser._id,
        public: false,
        created: Date.now(),
        updated: Date.now(),
      },
      callback: async () => Promise.resolve(undefined),
    };
    (reviewNewService.create as jest.Mock).mockResolvedValue(freshResponse);
  });

  describe('POST /review-new - HTTP Integration Test', () => {
    it('should successfully post review data', async () => {
      const response = await request(app.getHttpServer())
        .post('/review-new')
        .set('Content-Type', 'application/json')
        .send(testReviewData);

      expect(response.body).toBeDefined();
      expect(response.body.review).toBeDefined();
      expect(response.body.review._id).toBe('review123');
    });

    it('should return uuid and shortid', async () => {
      const response = await request(app.getHttpServer())
        .post('/review-new')
        .set('Content-Type', 'application/json')
        .send(testReviewData);

      expect(response.body.review.uuid).toBe('uuid-123-456');
      expect(response.body.review.shortid).toBe('abc123456');
    });

    it('should set review as private', async () => {
      const response = await request(app.getHttpServer())
        .post('/review-new')
        .set('Content-Type', 'application/json')
        .send(testReviewData);

      expect(response.body.review.public).toBe(false);
    });

    it('should preserve publication data', async () => {
      const response = await request(app.getHttpServer())
        .post('/review-new')
        .set('Content-Type', 'application/json')
        .send(testReviewData);

      expect(response.body.review.publication.title).toBe('Test Publication');
      expect(response.body.review.publication.pmid).toBe('12345678');
    });

    it('should preserve data section', async () => {
      const response = await request(app.getHttpServer())
        .post('/review-new')
        .set('Content-Type', 'application/json')
        .send(testReviewData);

      expect(response.body.review.data.data_availability).toBe('available');
    });

    it('should preserve model section', async () => {
      const response = await request(app.getHttpServer())
        .post('/review-new')
        .set('Content-Type', 'application/json')
        .send(testReviewData);

      expect(response.body.review.model.model_type).toBe('neural_network');
    });

    it('should preserve evaluation section', async () => {
      const response = await request(app.getHttpServer())
        .post('/review-new')
        .set('Content-Type', 'application/json')
        .send(testReviewData);

      expect(response.body.review.evaluation.evaluation_type).toBe('cross_validation');
    });

    it('should call service.create', async () => {
      await request(app.getHttpServer())
        .post('/review-new')
        .set('Content-Type', 'application/json')
        .send(testReviewData);

      expect(reviewNewService.create).toHaveBeenCalled();
    });

    it('should handle multiple POST requests', async () => {
      const response1 = await request(app.getHttpServer())
        .post('/review-new')
        .set('Content-Type', 'application/json')
        .send(testReviewData);

      const response2 = await request(app.getHttpServer())
        .post('/review-new')
        .set('Content-Type', 'application/json')
        .send(testReviewData);

      expect(response1.body.review._id).toBe('review123');
      expect(response2.body.review._id).toBe('review123');
      expect(reviewNewService.create).toHaveBeenCalledTimes(2);
    });

    it('should accept minimal review data', async () => {
      const minimalData: CreateReviewNewDto = {
        publication: {} as any,
        data: {} as any,
        optimization: {} as any,
        model: {} as any,
        evaluation: {} as any,
      };

      const response = await request(app.getHttpServer())
        .post('/review-new')
        .set('Content-Type', 'application/json')
        .send(minimalData);

      expect(response.body.review._id).toBe('review123');
    });

    it('should return timestamps', async () => {
      const response = await request(app.getHttpServer())
        .post('/review-new')
        .set('Content-Type', 'application/json')
        .send(testReviewData);

      expect(response.body.review.created).toBeDefined();
      expect(response.body.review.updated).toBeDefined();
      expect(typeof response.body.review.created).toBe('number');
    });

    it('should store user association', async () => {
      const response = await request(app.getHttpServer())
        .post('/review-new')
        .set('Content-Type', 'application/json')
        .send(testReviewData);

      expect(response.body.review.user).toBe(mockUser._id);
    });
  });
});
