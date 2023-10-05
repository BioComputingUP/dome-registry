import { IsNotEmpty } from "class-validator";
import { CreateReviewDto } from "./create-review.dto";


export class ReviewUser {
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