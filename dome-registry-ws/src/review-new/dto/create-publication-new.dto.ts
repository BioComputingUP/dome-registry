import { PublicationNew } from 'dome-registry-core';
import { IsArray, IsDefined, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePublicationNewDto implements PublicationNew {
  @ApiProperty({
    description: 'Title of the article',
    example: 'Identification of novel covid-19 Biomarkers by multiple feature selection strategies'
  })
  @IsString()
  @IsDefined()
  @Type(() => String)
  title: string = '';

  @ApiProperty({
    description: 'Authors name',
    example: 'John Doe, Jane Smith'
  })
  @IsString()
  @IsDefined()
  @Type(() => String)
  authors: string = '';

  @ApiProperty({
    description: 'Name of the journal where the paper has been published',
    example: 'Compute Math Methods Med'
  })
  @IsString()
  @IsDefined()
  @Type(() => String)
  journal: string = '';

  @ApiProperty({
    description: 'Year of publication',
    example: '2023'
  })
  @IsString()
  @IsDefined()
  @Type(() => String)
  year: string = '';

  @ApiProperty({
    description: 'Unique identifier of the reviewed article within PubMed',
    example: '999999'
  })
  @IsString()
  @IsDefined()
  @Type(() => String)
  pmid: string = '';

  @ApiProperty({
    description: 'DOI of the published article',
    example: '10.9999/2023/79752'
  })
  @IsString()
  @IsDefined()
  @Type(() => String)
  doi: string = '';

  @ApiProperty({
    description: 'PubMed Central ID',
    example: '7654321'
  })
  @IsString()
  @IsDefined()
  @Type(() => String)
  pmcid: string = '';

  @ApiProperty({
    description: 'Tags related to the annotation',
    example: ['covid', 'biomarkers']
  })
  @IsArray()
  @IsOptional()
  @Type(() => String)
  tags?: string[] = [];
}
