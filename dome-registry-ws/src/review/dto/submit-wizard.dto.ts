import { IsNotEmpty, Validate } from "class-validator";
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
    user: ReviewUser;

 
    @IsNotEmpty()
    review: CreateReviewDto

}

export class ReviewSubmission {

    @IsNotEmpty()
    ReviewUser: SubmitWizards
}