import { Publication} from 'dome-registry-core';
import {IsArray, IsDefined, IsOptional, IsString, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import { ApiBody, ApiProperty } from '@nestjs/swagger';


export class CreatePublicationDto implements Publication {
    
    //**----------Title-----------* */
    @ApiProperty({
        description: 'Title of the article',
        example: 'Identification of novel covid-19 Biomarkrs by multipe feature selection strategies'
    })
    @IsString()
    @IsDefined()
    @Type(() => String)
    title: string = '';

    //**------Authors---------------* */
    @ApiProperty({
        description: 'authors name',
        example: 'Jhon'
    })
    
    @IsString()
    @IsDefined()
    @Type(() => String)
    authors: string = '';
    
    
   //** ---------Publication Journal------ */
    @ApiProperty({
        description: 'Name of the journal where the paper has been published',
        example:'Compute Math Methods Med'
    })
    @ApiProperty()
    @IsString()
    @IsDefined()
    @Type(() => String)
    journal: string = '';

    //**-------Publication Year --------- */
        @ApiProperty({
            description:'Year of publication, as a number',
            example:'2023'
        })
        @IsString()
        @IsDefined()
        @Type(() => String)
        year: string = '';
    
    
    //**----------- Pubmed--------*/
        @ApiProperty({
            description:'Unique identifier of the reviewed article within PubMed',
            example: '999999'
        })
        @IsString()
        @IsDefined()
        @Type(() => String)
        pmid: string = '';  


    //** ------------Doi---------- */
    @ApiProperty({
        description: 'Doi of the published article',
        example:'10.9999/2023/79752'
    })
    @IsString()
    @IsDefined()
    @Type(() => String)
    doi: string = '';
    
    //* -------------Annotation Tags ----------------*/
    @ApiProperty({
        description: 'Doi of the published article',
        example:'10.9999/2023/79752'
    })
    @IsArray()
    
    @IsOptional()
    tags?: string[] | undefined;
     

    
// @IsInt()
    // @Min(0)
    // @Max(6)
    // @IsOptional()
    // @Type(() => Number)
    
    done: number = 0;
    // @IsInt()
    // @Min(0)
    // @Max(6)
    // @IsOptional()
    // @Type(() => Number)
   
    skip: number = 6;
}
