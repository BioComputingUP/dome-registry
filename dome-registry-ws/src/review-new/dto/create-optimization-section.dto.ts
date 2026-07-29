import { OptimizationAlgorithm, OptimizationConfig, OptimizationEncoding, OptimizationFeatures, OptimizationFitting, OptimizationMeta, OptimizationParameters, OptimizationRegularization, OptimizationSection } from 'dome-registry-core';
import { IsDefined, IsString, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOptimizationAlgorithmDto implements OptimizationAlgorithm {
  @ApiProperty({
    description: 'What is the ML Algorithm used',
    example: 'Support Vector Machine (SVM)'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  algName: string = '';

  @ApiProperty({
    description: 'Is the machine learning Algorithm new',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isNewAlg: boolean = false;

  @ApiProperty({
    description: 'If its a new ML Algorithm, why its not published in a machine learning journal',
    example: 'Not applicable - algorithm is established'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  algPrevPublished: string = '';
}

export class CreateOptimizationConfigDto implements OptimizationConfig {
  @ApiProperty({
    description: 'Are the hyper-parameter configurations, optimization schedule, model files... available?',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isAvailable: boolean = false;

  @ApiProperty({
    description: 'If yes, where and how (license)?',
    example: 'MIT License on GitHub'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  licence: string = '';
}

export class CreateOptimizationEncodingDto implements OptimizationEncoding {
  @ApiProperty({
    description: 'How was the data encoding and preprocessed an encoded for the machine learning algorithm',
    example: 'Normalization using z-score standardization'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  encMethod: string = '';
}

export class CreateOptimizationFeaturesDto implements OptimizationFeatures {
  @ApiProperty({
    description: 'How many features (f) are used as input?',
    example: '50'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  numFeatures: string = '';

  @ApiProperty({
    description: 'Was feature selection performed?',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  featSelection: boolean = false;

  @ApiProperty({
    description: 'If feature selection was performed, was it done using the training set only?',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  trainingOnlySelection: boolean = false;
}

export class CreateOptimizationFittingDto implements OptimizationFitting {
  @ApiProperty({
    description: 'Is the number of parameters much larger than the number of training points?',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isParamsLarger: boolean = false;

  @ApiProperty({
    description: 'If yes to the previous question, how was over-fitting ruled out?',
    example: 'Cross-validation, early stopping'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  noOverFit: string = '';

  @ApiProperty({
    description: 'Conversely, how was under-fitting ruled out?',
    example: 'Monitored training loss, increased model complexity'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  noUnderFit: string = '';
}

export class CreateOptimizationMetaDto implements OptimizationMeta {
  @ApiProperty({
    description: 'Does the model use data from other machine-learning algorithms as input?',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isMeta: boolean = false;

  @ApiProperty({
    description: 'If it is a meta-predictor, which machine-learning methods constitute the whole?',
    example: 'Random Forest, Gradient Boosting'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  metaMethods: string = '';

  @ApiProperty({
    description: 'If it is a meta-predictor, is it completely clear that training data is independent?',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  metaIndep: boolean = false;
}

export class CreateOptimizationParametersDto implements OptimizationParameters {
  @ApiProperty({
    description: 'How many parameters (p) are used in the model?',
    example: '100'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  numParams: string = '';

  @ApiProperty({
    description: 'How was p selected?',
    example: 'Grid search with cross-validation'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  pSelMeth: string = '';
}

export class CreateOptimizationRegularizationDto implements OptimizationRegularization {
  @ApiProperty({
    description: 'Were any over-fitting prevention techniques performed?',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  hasReg: boolean = false;

  @ApiProperty({
    description: 'If yes, which ones?',
    example: 'L2 regularization, dropout'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  regTechs: string = '';
}

export class CreateOptimizationSectionDto implements OptimizationSection {
  @ApiProperty({ type: CreateOptimizationAlgorithmDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateOptimizationAlgorithmDto)
  algorithm: OptimizationAlgorithm = new CreateOptimizationAlgorithmDto();

  @ApiProperty({ type: CreateOptimizationConfigDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateOptimizationConfigDto)
  config: OptimizationConfig = new CreateOptimizationConfigDto();

  @ApiProperty({ type: CreateOptimizationEncodingDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateOptimizationEncodingDto)
  encoding: OptimizationEncoding = new CreateOptimizationEncodingDto();

  @ApiProperty({ type: CreateOptimizationFeaturesDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateOptimizationFeaturesDto)
  features: OptimizationFeatures = new CreateOptimizationFeaturesDto();

  @ApiProperty({ type: CreateOptimizationFittingDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateOptimizationFittingDto)
  fitting: OptimizationFitting = new CreateOptimizationFittingDto();

  @ApiProperty({ type: CreateOptimizationMetaDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateOptimizationMetaDto)
  meta: OptimizationMeta = new CreateOptimizationMetaDto();

  @ApiProperty({ type: CreateOptimizationParametersDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateOptimizationParametersDto)
  parameters: OptimizationParameters = new CreateOptimizationParametersDto();

  @ApiProperty({ type: CreateOptimizationRegularizationDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateOptimizationRegularizationDto)
  regularisation: OptimizationRegularization = new CreateOptimizationRegularizationDto();
}
