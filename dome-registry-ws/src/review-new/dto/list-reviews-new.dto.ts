import {
  IsBoolean,
  IsDefined,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ListReviewsNewDto {
  @ApiProperty({
    default: 0,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  skip: number = 0;

  @ApiProperty({
    default: 100,
    description: 'the limit number of the imports reviews (defined as 100)',
  })
  @IsInt()
  @Min(0)
  @Max(1000)
  @Type(() => Number)
  limit: number = 100;

  @ApiProperty({
    description: 'the text to look for in the database',
  })
  @IsString()
  @MaxLength(100)
  @Type(() => String)
  text: string = '';

  @ApiProperty({
    description: 'Are the reviews public or not',
    example: 'True | False',
    default: true,
  })
  @IsBoolean()
  @Type(() => String)
  @Transform(({ value }) => value === 'true')
  public: boolean = true;

  @ApiProperty({
    description: 'Filter reviews by field',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  filter?: string;

  @ApiProperty({
    description: 'Filter by AI generated status',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  isAiGenerated?: boolean;

  @ApiProperty({
    description: 'Sort by field',
    default: 'created',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  sort?: string = 'created';

  @ApiProperty({
    description: 'Sort ascending (true) or descending (false)',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    return false;
  })
  asc?: boolean = false;
}
