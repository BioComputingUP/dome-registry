import {Model} from 'dome-registry-core';
import {IsDefined, IsString} from "class-validator";
import {Type} from "class-transformer";
import { ApiProperty } from '@nestjs/swagger';


export class CreateModelDto implements Model {
    
    //** -----------interpretability-------------- */
    @ApiProperty({
        description:'Is the model black box or interpretable? If the model is interpretable, can you give clear examples of this?',
        example:'Black Box',
        type:[String],
    })
    @IsString()
    @IsDefined()
    @Type(() => String)
    interpretability: string = '';


//** -----------output-------------- */
    @ApiProperty({
        description:'Is the model classification or regression?',
        example:'Regression | Classification',
        type:[String],
    })
    @IsString()
    @IsDefined()
    @Type(() => String)
    output: string = '';
   
    

  //** -----------Duration (execution time)-------------- */
    @ApiProperty({
        description:'Is the source code released? Is a method to run the algorithm—such as executable, web server, virtual machine or container instance—released? If yes, where (for example, URL) and how (license)?',
        example:'The whole computation process took several ten hours , We used Pentium IV desktop PC with dual CPU (2.8 GHz) and 2 GB RAM.',
        type:[String],
    })
    @IsString()
    @IsDefined()
    @Type(() => String)
    duration: string = '';



//** -----------Availability-------------- */
    @ApiProperty({
        description:'Is the source code released? Is a method to run the algorithm—such as executable, web server, virtual machine or container instance—released? If yes, where (for example, URL) and how (license)?',
        example:'Method and data are available to the public upon request.',
        type:[String],
    })
    @IsString()
    @IsDefined()
    @Type(() => String)
    availability: string = '';




    // @IsInt()
    // @Min(0)
    // @Max(4)
    // @IsOptional()
    // @Type(() => Number)
   
    done: number = 0;
    // @IsInt()
    // @Min(0)
    // @Max(4)
    // @IsOptional()
    // @Type(() => Number)
    
    skip: number = 4;
}

