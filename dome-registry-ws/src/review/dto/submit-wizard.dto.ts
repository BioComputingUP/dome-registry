import { IsNotEmpty, Validate,ValidateNested } from "class-validator";
import { CreateReviewDto } from "./create-review.dto";
import { OrcidChecksum } from "../orcid-cheksum.service";



export class ReviewUser {
    @Validate(OrcidChecksum)
    @IsNotEmpty()
    orcid_id: string;
    email: string;
    name: string;
}


export class SubmitWizards {

    @IsNotEmpty()
    @ValidateNested()
    user: ReviewUser;

    @IsNotEmpty()
    @ValidateNested()
    review: CreateReviewDto

}

export class ReviewSubmission {
    @IsNotEmpty()
    @ValidateNested()
    ReviewUser: SubmitWizards
}



