import { Publication, Evaluation, Model, Optimization, DataSection } from 'dome-registry-core';
import { IsDefined, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePublicationNewDto } from './create-publication-new.dto';
import { CreateDataSectionDto } from './create-data-section.dto';
import { CreateOptimizationSectionDto } from './create-optimization-section.dto';
import { CreateModelSectionDto } from './create-model-section.dto';
import { CreateEvaluationSectionDto } from './create-evaluation-section.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewNewDto {
  @ApiProperty({ type: CreatePublicationNewDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreatePublicationNewDto)
  publication: any = new CreatePublicationNewDto();

  @ApiProperty({ type: CreateDataSectionDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateDataSectionDto)
  data: any = new CreateDataSectionDto();

  @ApiProperty({ type: CreateOptimizationSectionDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateOptimizationSectionDto)
  optimization: any = new CreateOptimizationSectionDto();

  @ApiProperty({ type: CreateModelSectionDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateModelSectionDto)
  model: any = new CreateModelSectionDto();

  @ApiProperty({ type: CreateEvaluationSectionDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateEvaluationSectionDto)
  evaluation: any = new CreateEvaluationSectionDto();
}
