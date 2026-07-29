import { DataAvailability, DataProvenance, DataRedundancy, DataSplits, DataSection } from 'dome-registry-core';
import { IsDefined, IsString, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDataAvailabilityDto implements DataAvailability {
  @ApiProperty({
    description: 'Are the data, including the data splits used, released in a public forum?',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPublic: boolean = false;

  @ApiProperty({
    description: 'If yes, where and how (license)?',
    example: 'CC-BY 4.0 on GitHub'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  licence: string = '';
}

export class CreateDataProvenanceDto implements DataProvenance {
  @ApiProperty({
    description: 'Source of the dataset',
    example: 'NCBI Gene Expression Omnibus'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  source: string = '';

  @ApiProperty({
    description: 'Number of data points',
    example: '5000'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  numDataPoints: string = '';

  @ApiProperty({
    description: 'Data used in previous paper and/or by community?',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPrevUse: boolean = false;
}

export class CreateDataRedundancyDto implements DataRedundancy {
  @ApiProperty({
    description: 'How were the datasets split?',
    example: 'Random stratified split'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  splitMethod: string = '';

  @ApiProperty({
    description: 'Are the training and test sets independent?',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isIndependent: boolean = false;

  @ApiProperty({
    description: 'How was this enforced?',
    example: 'Temporal separation, patient separation'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  enforceMethod: string = '';

  @ApiProperty({
    description: 'How does the distribution compare to previously published ML datasets?',
    example: 'Similar distribution to published benchmarks'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  distributionComp: string = '';
}

export class CreateDataSplitsDto implements DataSplits {
  @ApiProperty({
    description: 'How many Data splits?',
    example: '3'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  numSplits: string = '';

  @ApiProperty({
    description: 'How many data points in each split',
    example: 'Train: 3000, Val: 1000, Test: 1000'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  dataPointsPerSplit: string = '';

  @ApiProperty({
    description: 'If the number of data splits is greater than two (2), what were other splits?',
    example: 'Validation set for hyperparameter tuning'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  otherSplits: string = '';

  @ApiProperty({
    description: 'What is the distribution of data points in each data split',
    example: '60% train, 20% validation, 20% test'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  splitDist: string = '';
}

export class CreateDataSectionDto implements DataSection {
  @ApiProperty({ type: CreateDataAvailabilityDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateDataAvailabilityDto)
  availability: DataAvailability = new CreateDataAvailabilityDto();

  @ApiProperty({ type: CreateDataProvenanceDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateDataProvenanceDto)
  provenance: DataProvenance = new CreateDataProvenanceDto();

  @ApiProperty({ type: CreateDataRedundancyDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateDataRedundancyDto)
  redundancy: DataRedundancy = new CreateDataRedundancyDto();

  @ApiProperty({ type: CreateDataSplitsDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateDataSplitsDto)
  splits: DataSplits = new CreateDataSplitsDto();
}
