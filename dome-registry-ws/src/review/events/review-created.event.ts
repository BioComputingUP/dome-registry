
import { User } from "src/user/user.schema";
import { ReviewDocument } from "../review.schema";

export class ReviewCreatedEvent {
    constructor(
      public review: ReviewDocument,
      public creator: User
    ){}
  }