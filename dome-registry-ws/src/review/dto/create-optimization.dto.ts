import { Optimization} from 'dome-registry-core';
import {IsDefined, IsString, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import { ApiProperty, ApiTags } from '@nestjs/swagger';



export class CreateOptimizationDto implements Optimization {
    
    //** -----------Algorithm-----------**/
    @ApiProperty({
        description:'What is the ML algorithm class used? Is the ML algorithm new? If yes, why was it chosen over better known alternatives?',
        example:'Support Vector Machine (SVM) classification with RBF kernel',
        type:[String],
    })
    @IsString()
    @IsDefined()
    @Type(() => String)
    algorithm: string = '';



    
    //** -----------Meta-----------**/
    @ApiProperty({
        description:'Does the model use data from other ML algorithms as input? If yes, which ones? Is it clear that training data of initial predictors and meta-predictor are independent of test data for the meta-predictor?',
        example:'NO',
        type:[String],
    })
    @IsString()
    @IsDefined()
    @Type(() => String)
    meta: string = 'No';


    @ApiProperty({
        description:'What is the ML algorithm class used? Is the ML algorithm new? If yes, why was it chosen over better known alternatives?',
        example:'Support Vector Machine (SVM) classification with RBF kernel',
        type:[String],
    })
    @IsString()
    @IsDefined()
    @Type(() => String)
    config: string = '';

    @ApiProperty({
        description:'How were the data encoded and preprocessed for the ML algorithm?',
        example:'Feature selection.',
        type:[String],
    })
    @IsString()
    @IsDefined()
    @Type(() => String)
    encoding: string = '';



    @ApiProperty({
        description:'What is the ML algorithm class used? Is the ML algorithm new? If yes, why was it chosen over better known alternatives?',
        example:'Hybrid feature selection schema based on information gain and sequential backward',
        type:[String],
    })
    @IsString()
    @IsDefined()
    @Type(() => String)
    @ApiProperty()
    features: string = '';



    @ApiProperty({
        description:'Is p much larger than the number of training points and/or is f large (for example, in classification is p≫(Npos+Nneg) and/or f > 100)? If yes, how was overfitting ruled out? Conversely, if the number of training points is much larger than p and/or f is small (for example, (Npos+Nneg)≫p and/or f < 5), how was underfitting ruled out?',
        example:'',
        type:[String],
    })
    @IsString()
    @IsDefined()
    @Type(() => String)
    fitting: string = '';




    @ApiProperty({
        description:'How many parameters (p) are used in the model? How was p selected?',
        example:'100 features used to describe the frequency',
        type:[String],
    })
    @IsString()
    @IsDefined()
    @Type(() => String)
    parameters: string = '';


    
    @ApiProperty({
        description:'Were any overfitting prevention techniques used (for example, early stopping using a validation set)? If yes, which ones?',
        example:'Yes, by setting the regularization parameter C=4.',
        type:[String],
    })
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
