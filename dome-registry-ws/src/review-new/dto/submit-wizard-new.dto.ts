import { IsNotEmpty, ValidateNested } from 'class-validator';
import { CreateReviewNewDto } from './create-review-new.dto';
import { OrcidChecksum } from '../../review/orcid-cheksum.service';
import { Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserNew {
  email: string;
  name: string;
  @Validate(OrcidChecksum)
  @IsNotEmpty()
  orcid: string;
}

export class SubmitWizardsNew {
  @IsNotEmpty()
  @Type(() => UserNew)
  @ValidateNested()
  user: UserNew;

  @IsNotEmpty()
  @Type(() => CreateReviewNewDto)
  @ValidateNested()
  review: CreateReviewNewDto;
}

export class ReviewSubmissionNew {
  @IsNotEmpty()
  @Type(() => SubmitWizardsNew)
  @ValidateNested()
  ReviewUser: SubmitWizardsNew;
}
