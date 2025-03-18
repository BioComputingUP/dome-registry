import { IsBoolean, IsDefined, IsIn, IsInt, IsString, Max, MaxLength, Min } from "class-validator";
import { Transform, Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";



export const filterFields = {
  title: "publication.title",
  authors: "publication.authors",
  journal: "publication.journal",
  year: "publication.year",
  tags: "publication.tags",
}
export class GetReviewsDto {

     @IsIn(Object.keys(filterFields))
      field: keyof typeof filterFields;
    
    
      text: string;
      @Type(() => String)
      @IsIn(['publication.year', 'publication.title', 'publication.authors', 'score'])
  
  
      
      sort: string = 'date';

      
      skip: number = 0;
      
      limit: number = 100;
       
      asc: boolean = true;




}