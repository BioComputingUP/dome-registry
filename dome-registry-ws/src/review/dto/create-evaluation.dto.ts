import { Evaluation} from 'dome-registry-core';
import {IsDefined, IsString} from "class-validator";
import {Type} from "class-transformer";
import { ApiProperty } from '@nestjs/swagger';


export class CreateEvaluationDto implements Evaluation {
    
    
    //**-------------Evaluation method------- */
    @ApiProperty({
        description:'How was the method evaluated (for example cross-validation, independent dataset, novel experiments)?',
        example:'positive case of the independent dataset was validated through wet-lab experiments.',
        type:[String],
    })
    @IsString()
    @IsDefined()
    @Type(() => String)
    method: string = '';
    
    

    //**-------------Performance measures------- */
     @ApiProperty({
        description:'Which performance metrics are reported? Is this set representative (for example, compared to the literature)?',
        example:'Accuracy, Recall, Precision.',
        type:[String],
    })
    @IsString()
    @IsDefined()
    @Type(() => String)
    measure: string = '';



    //**---------Methods comparison-----------*/
    @ApiProperty({
        description:'Was a comparison to publicly available methods performed on benchmark datasets? Was a comparison to simpler baselines performed?',
        example:'EffectiveT3, T3SS prediction. Known classifiers for T3SS effector prediction. SVC with cross-validation but with different data encoding.',
        type:[String],
    })
    @IsString()
    @IsDefined()
    @Type(() => String)
    comparison: string = '';



    @ApiProperty({
        description:'Do the performance metrics have confidence intervals? Are the results statistically significant to claim that the method is superior to others and baselines?',
        example:'Only the non-redundant data were used for the comparisons. Very low precision from EffectiveT3 (recall of 72.2% and precision of 17.9%) and T3SS prediction (recall of 83.3% and precision of 24%) due to being developed in less imbalanced and non-realistic training sets. For different data encoding methods, the recall and precision of effectors were 55.6% and 84.5%, respectively, which were over 5% lower than those of the proposed SSE-ACC method.',
        type:[String],
    })
    @IsString()
    @IsDefined()
    @Type(() => String)
    confidence: string = '';
    


 //**---------Availability-----------*/
    @ApiProperty({
        description:'Are the raw evaluation files (for example, assignments for comparison and baselines, statistical code, confusion matrices) available? If yes, where (for example, URL) and how (license)?',
        example:'Method and data are available to the public upon request.',
        type:[String],
    })
    @IsString()
    @IsDefined()
    @Type(() => String)
    availability: string = '';
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

