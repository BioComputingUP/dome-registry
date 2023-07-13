import { Test, TestingModule } from '@nestjs/testing';
import { OrcidOauthController } from './orcid-oauth.controller';

describe('OrcidOauthController', () => {
  let controller: OrcidOauthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrcidOauthController],
    }).compile();

    controller = module.get<OrcidOauthController>(OrcidOauthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
