import { Review, ReviewDocument } from "../review/review.schema";
import { User } from "../user/user.decorator";
import { UserSchema } from "../user/user.schema";
import { Role } from "../roles/role.enum";
import {
  AbilityBuilder,
  AbilityClass,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
  MongoQuery,
} from "@casl/ability";
import { ListReviewsDto } from "../review/dto/list-reviews.dto";
import { Injectable } from "@nestjs/common";
import { Action } from "../Actions/action.enum";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
//import { Action } from "rxjs/internal/scheduler/Action";

export type AppAbility = MongoAbility<PossibleAbilities, Conditions>;

// type for the condition Created to li:mit the visibility

type ReviewConditions = {
  public: boolean;
  publication: {
    journal: string;
  };
  user: string;
};

type Subjects = InferSubjects<typeof Review>;

type PossibleAbilities = [Action, Subjects];

type Conditions = MongoQuery<ReviewDocument>; // Specify Review type explicitly

@Injectable()
export class CaslAbilityFactory {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>
  ) {}

  createForUser(@User() user) {
    const { can, cannot, build } = new AbilityBuilder(
      createMongoAbility<PossibleAbilities, Conditions>
    );

    can(Action.Read, this.reviewModel, { public: true });

    if (user?.roles === Role.Admin) {
      if (user.organisation === "biocomp") {
        can(Action.Manage, this.reviewModel);
      } else {
        // Admins can read public reviews

      //  can(Action.Manage, this.reviewModel, {  public: false, 'publication.journal': {$in: user.organizations}  );


       
        




        // Admins of specific organization can manage their organization's reviews
      }
    } else {
      can(Action.Manage, this.reviewModel, { public: false, user: user._id });
    }

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
