import {
  IsBoolean,
  IsDefined,
  IsIn,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class ListReviewsDto {
  @ApiProperty({
    default: 0,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  skip: number = 0;

  @ApiProperty({
    default: 100,
    description: "the limit number of the imports reviews (defined as 100)",
  })
  @IsInt()
  @Min(0)
  @Max(1000)
  @Type(() => Number)
  limit: number = 100;

  @ApiProperty({
    description: "the text to look for in the database",
  })
  @IsString()
  @MaxLength(100)
  @Type(() => String)
  text: string = "";

  @ApiProperty({
    description: "Are the reviews public or not",
    example: "True | False",
    default: true,
  })
  @IsBoolean()
  @Type(() => String)
  @Transform(({ value }) => value === "true")
  public: boolean = true;

  @ApiProperty({
    description: "Type of sort",
    example: "Year | Title | Authors | Score",
  })
  @Type(() => String)
  @IsIn([
    "publication.year",
    "publication.title",
    "publication.authors",
    "score",
  ])
  sort: string = "date";

  @ApiProperty({
    description: "Async or not",
    example: "True|False",
    default: true,
  })
  @IsBoolean()
  @Type(() => String)
  @Transform(({ value }) => value === "true")
  asc: boolean = true;
}
