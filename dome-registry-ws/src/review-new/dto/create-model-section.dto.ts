import { ModelAvailability, ModelDuration, ModelInterpretability, ModelOutput, ModelSection } from 'dome-registry-core';
import { IsDefined, IsString, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModelAvailabilityDto implements ModelAvailability {
  @ApiProperty({
    description: 'Is the source code released?',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isCodeAvail: boolean = false;

  @ApiProperty({
    description: 'Is a method to run the algorithm such as executable, web server... released?',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isExecAvailable: boolean = false;

  @ApiProperty({
    description: 'If yes to public release, where and how (license)?',
    example: 'Apache 2.0 on GitHub'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  licence: string = '';
}

export class CreateModelDurationDto implements ModelDuration {
  @ApiProperty({
    description: 'How much time did it take for the model to run...?',
    example: '2.5 hours for training on GPU'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  runTime: string = '';
}

export class CreateModelInterpretabilityDto implements ModelInterpretability {
  @ApiProperty({
    description: 'Is the model blackbox or transparent?',
    example: 'Transparent - Linear model with interpretable coefficients'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  interpType: string = '';

  @ApiProperty({
    description: 'If the model is transparent, can you give clear examples for this?',
    example: 'Feature importance scores show which genes are most predictive'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  transpExp: string = '';
}

export class CreateModelOutputDto implements ModelOutput {
  @ApiProperty({
    description: 'Is the model classification or regression?',
    example: 'Binary classification'
  })
  @IsString()
  @IsOptional()
  @Type(() => String)
  outType: string = '';
}

export class CreateModelSectionDto implements ModelSection {
  @ApiProperty({ type: CreateModelAvailabilityDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateModelAvailabilityDto)
  availability: ModelAvailability = new CreateModelAvailabilityDto();

  @ApiProperty({ type: CreateModelDurationDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateModelDurationDto)
  duration: ModelDuration = new CreateModelDurationDto();

  @ApiProperty({ type: CreateModelInterpretabilityDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateModelInterpretabilityDto)
  interpretability: ModelInterpretability = new CreateModelInterpretabilityDto();

  @ApiProperty({ type: CreateModelOutputDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateModelOutputDto)
  output: ModelOutput = new CreateModelOutputDto();
}
