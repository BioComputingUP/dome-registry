import { IsNotEmpty, IsOptional, Validate,ValidateNested } from "class-validator";
import { CreateReviewDto } from "./create-review.dto";
import { OrcidChecksum } from "../orcid-cheksum.service";
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class User {
    email: string;
    name: string;
    @Validate(OrcidChecksum)
    @IsNotEmpty()
    orcid: string;
}


export class SubmitWizards {

    @IsNotEmpty()
    @Type(()=>User)
    @ValidateNested()
    user: User;

    @IsNotEmpty()
    @Type(()=>CreateReviewDto)
    //@ValidateNested()
    review: CreateReviewDto

}

export class ReviewSubmission {
    
    @IsNotEmpty()
    @Type(() => SubmitWizards)
    @ValidateNested()
    ReviewUser: SubmitWizards
}





