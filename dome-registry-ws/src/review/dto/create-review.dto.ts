import {Dataset, Evaluation, Model, Optimization, Publication} from 'dome-registry-core';
import {IsDefined, IsString, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import { CreateDatasetDto } from './create-dataset.dto';
import { CreateEvaluationDto } from './create-evaluation.dto';
import { CreateOptimizationDto } from './create-optimization.dto';
import { CreateModelDto } from './create-model.dto';
import { CreatePublicationDto } from './create-publicatin.dto';
import { ApiProperty } from '@nestjs/swagger';



export class CreateReviewDto {
    
    @ApiProperty({ type: CreatePublicationDto})
    @IsDefined()
    @ValidateNested()
    @Type(() => CreatePublicationDto)
    publication: Publication = new CreatePublicationDto();


    @ApiProperty({type: CreateDatasetDto})
    @IsDefined()
    @ValidateNested()
    @Type(() => CreateDatasetDto)
    dataset: Dataset = new CreateDatasetDto();


    @ApiProperty({type: CreateOptimizationDto})
    @IsDefined()
    @ValidateNested()
    @Type(() => CreateOptimizationDto)
    optimization: Optimization = new CreateOptimizationDto();
    

    @ApiProperty({ type: CreateModelDto})
    @IsDefined()
    @ValidateNested()
    @Type(() => CreateModelDto)
    model: Model = new CreateModelDto();
    
    


    @ApiProperty({type: CreateOptimizationDto})
    @IsDefined()
    @ValidateNested()
    @Type(() => CreateEvaluationDto)
    evaluation: Evaluation = new CreateEvaluationDto();

}
