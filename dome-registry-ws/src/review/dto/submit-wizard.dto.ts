import { IsNotEmpty, Validate } from "class-validator";
import { CreateReviewDto } from "./create-review.dto";
import { OrcidChecksum } from "../orcid-cheksum.service";
import { ValidateNested } from 'class-validator';


export class ReviewUser {
    @Validate(OrcidChecksum)
    @IsNotEmpty()
    orcid_id: string;
    email: string;
    name: string;
}


export class SubmitWizards {

    @ValidateNested()
    @IsNotEmpty()
    user: ReviewUser;

    @ValidateNested()
    @IsNotEmpty()
    review: CreateReviewDto

}

export class ReviewSubmission {
    @ValidateNested()
    @IsNotEmpty()
    ReviewUser: SubmitWizards
}



