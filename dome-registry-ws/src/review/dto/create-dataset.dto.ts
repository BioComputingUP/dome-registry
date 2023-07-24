import {Dataset} from 'dome-registry-core';
import {IsDefined, IsString, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import { ApiProperty } from '@nestjs/swagger';




export class CreateDatasetDto implements Dataset {

    //**-------------provenance--------- **/
    @ApiProperty({
        description:'Dataset source. \n ,number od data points \n data used in previous paper and/or by community',
        example:'Biocompup',
        type:[String],
    })
    @IsString()
    @IsDefined()
    @Type(() => String)
    provenance: string = '';

    //**-------------Splits------------**/
    
    @ApiProperty({   description:'Number of datapoints in the trainning and test set  \n  Was a separate validation set used, and if yes, how large was it?  \n Are the distributions of data types in the training and test sets different? Are the distributions of data types in both training and test sets plotted?',
    example:' train: 180 val:78 test:78',
    type:[String], })
    @IsString()
    @IsDefined()
    @Type(() => String)
    splits: string = '';

    
    //**---------Redundancy------- */
    @ApiProperty({
        description:'Redundancy between sets splits  \n discription of independency between training and test sets \n enforcement details \n details about distribution comparing to previously published ML datasets in the biological field ',
        example:'all datasets are without overlap, kept coincident for each trial of the algorithms.',
        type:[String],
    })
    @IsString()
    @IsDefined()
    @Type(() => String)
    redundancy: string = '';


    //**---------Dataset Availability --------*/
    @ApiProperty({
        description:' Dataset Availability ',
        example : 'yes its available on ther link http://example.com/#arch',
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
            