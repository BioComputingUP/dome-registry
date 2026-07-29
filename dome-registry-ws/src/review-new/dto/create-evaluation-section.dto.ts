import { EvaluationMethod, EvaluationAvailability, EvaluationComparison, EvaluationConfidence, EvaluationMeasure, EvaluationSection } from 'dome-registry-core';
import { IsDefined, IsString, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEvaluationMethodDto implements EvaluationMethod {
  @ApiProperty({
    description: 'How was the method evaluated? (E.g. cross-validation, independent dataset...)',
    example: '5-fold cross-validation'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  evalMethod: string = '';
}

export class CreateEvaluationAvailabilityDto implements EvaluationAvailability {
  @ApiProperty({
    description: 'Are the raw evaluation files available?',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isRawAvail: boolean = false;

  @ApiProperty({
    description: 'If publicly released, where and how (license)?',
    example: 'CC-BY 4.0 on Zenodo'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  licence: string = '';
}

export class CreateEvaluationComparisonDto implements EvaluationComparison {
  @ApiProperty({
    description: 'Was a comparison to publicly available methods performed on benchmark datasets?',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  hasPublicComparison: boolean = false;

  @ApiProperty({
    description: 'Was a comparison to simpler baselines performed?',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  hasBaseComparison: boolean = false;
}

export class CreateEvaluationConfidenceDto implements EvaluationConfidence {
  @ApiProperty({
    description: 'Do the performance metrics have confidence intervals?',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  confidenceInterval: boolean = false;

  @ApiProperty({
    description: 'Are the results statistically significant to claim that the method is superior...?',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  statSignificant: boolean = false;
}

export class CreateEvaluationMeasureDto implements EvaluationMeasure {
  @ApiProperty({
    description: 'Which performance metrics are reported?',
    example: 'Accuracy, Precision, Recall, F1-Score, AUC-ROC'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  metrics: string = '';

  @ApiProperty({
    description: 'Is this set of metrics representative (e.g. compared to the literature)?',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isRepresentative: boolean = false;
}

export class CreateEvaluationSectionDto implements EvaluationSection {
  @ApiProperty({ type: CreateEvaluationMethodDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateEvaluationMethodDto)
  method: EvaluationMethod = new CreateEvaluationMethodDto();

  @ApiProperty({ type: CreateEvaluationAvailabilityDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateEvaluationAvailabilityDto)
  availability: EvaluationAvailability = new CreateEvaluationAvailabilityDto();

  @ApiProperty({ type: CreateEvaluationComparisonDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateEvaluationComparisonDto)
  comparison: EvaluationComparison = new CreateEvaluationComparisonDto();

  @ApiProperty({ type: CreateEvaluationConfidenceDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateEvaluationConfidenceDto)
  confidance: EvaluationConfidence = new CreateEvaluationConfidenceDto();

  @ApiProperty({ type: CreateEvaluationMeasureDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateEvaluationMeasureDto)
  measure: EvaluationMeasure = new CreateEvaluationMeasureDto();
}
