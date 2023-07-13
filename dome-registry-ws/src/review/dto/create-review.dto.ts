import {Dataset, Evaluation, Model, Optimization, Publication} from 'dome-registry-core';
import {IsDefined, IsString, ValidateNested} from "class-validator";
import {Type} from "class-transformer";


class CreatePublicationDto implements Publication {
    @IsString()
    @IsDefined()
    @Type(() => String)
    authors: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    doi: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    journal: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    pmid: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    title: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    year: string = '';
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


class CreateDatasetDto implements Dataset {
    @IsString()
    @IsDefined()
    @Type(() => String)
    availability: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    provenance: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    redundancy: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    splits: string = '';
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


class CreateModelDto implements Model {
    @IsString()
    @IsDefined()
    @Type(() => String)
    availability: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    duration: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    interpretability: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    output: string = '';
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


class CreateOptimizationDto implements Optimization {
    @IsString()
    @IsDefined()
    @Type(() => String)
    algorithm: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    config: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    encoding: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    features: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    fitting: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    meta: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    parameters: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    regularization: string = '';
    // @IsInt()
    // @Min(0)
    // @Max(8)
    // @IsOptional()
    // @Type(() => Number)
    done: number = 0;
    // @IsInt()
    // @Min(0)
    // @Max(8)
    // @IsOptional()
    // @Type(() => Number)
    skip: number = 8;
}


class CreateEvaluationDto implements Evaluation {
    @IsString()
    @IsDefined()
    @Type(() => String)
    availability: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    comparison: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    confidence: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    measure: string = '';
    @IsString()
    @IsDefined()
    @Type(() => String)
    method: string = '';
    // @IsInt()
    // @Min(0)
    // @Max(5)
    // @IsOptional()
    // @IsOptional()
    // @Type(() => Number)
    done: number = 0;
    // @IsInt()
    // @Min(0)
    // @Max(5)
    // @IsOptional()
    // @Type(() => Number)
    skip: number = 5;
}


export class CreateReviewDto {

    @IsDefined()
    @ValidateNested()
    @Type(() => CreatePublicationDto)
    publication: Publication = new CreatePublicationDto();

    @IsDefined()
    @ValidateNested()
    @Type(() => CreateDatasetDto)
    dataset: Dataset = new CreateDatasetDto();

    @IsDefined()
    @ValidateNested()
    @Type(() => CreateModelDto)
    model: Model = new CreateModelDto();

    @IsDefined()
    @ValidateNested()
    @Type(() => CreateOptimizationDto)
    optimization: Optimization = new CreateOptimizationDto();

    @IsDefined()
    @ValidateNested()
    @Type(() => CreateEvaluationDto)
    evaluation: Evaluation = new CreateEvaluationDto();

}
