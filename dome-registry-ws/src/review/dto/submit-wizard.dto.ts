import { IsNotEmpty, Validate,ValidateNested } from "class-validator";
import { CreateReviewDto } from "./create-review.dto";
import { OrcidChecksum } from "../orcid-cheksum.service";
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ReviewUser {
    @Validate(OrcidChecksum)
    @IsNotEmpty()
    orcid_id: string;
    email: string;
    name: string;
}


export class SubmitWizards {

    @IsNotEmpty()
    @Type(()=>ReviewUser)
    user: ReviewUser;

    @IsNotEmpty()
    @Type(()=>CreateReviewDto)
    review: CreateReviewDto

}

export class ReviewSubmission {
    @IsNotEmpty()
    @Type(() => SubmitWizards)
    ReviewUser: SubmitWizards
}





