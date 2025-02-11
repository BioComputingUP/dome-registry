import { Review } from "src/review/review.schema";
import { User } from "src/user/user.decorator";
import { UserSchema } from "src/user/user.schema";
// import {
//     Ability,
//     AbilityBuilder,
//     AbilityClass,
//     ExtractSubjectType,
//     InferSubjects,
//   } from '@casl/ability';
  import { Injectable } from '@nestjs/common';

// type Subject = InferSubjects<typeof Review | typeof UserSchema> | 'all' ; 


export class CaslAbilityFactory {}
