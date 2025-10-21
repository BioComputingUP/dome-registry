import {BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Types, Model, Query, QueryOptions, mongo} from "mongoose";
import {Review, ReviewDocument} from "./review.schema";
import {User, UserDocument} from "../user/user.schema";
import {computeDomeScore} from "dome-registry-core";
import {Role} from "../roles/role.enum";
import ShortUniqueId from "short-unique-id";
import {timestamp} from "rxjs";
import {ClientService} from "src/apicuron-sub/apicuron-client.service";
import {EventEmitter2} from "@nestjs/event-emitter";
import {randomBytes, randomUUID} from 'crypto';


import {ReviewCreatedEvent} from "./events/review-created.event";
import {writeFileSync} from "fs";

@Injectable()
export class ReviewService {
  private uid: ShortUniqueId;

  // Dependency injection
  constructor(
      @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
      @InjectModel(User.name) private userModel: Model<UserDocument>,
      private eventEmitter: EventEmitter2
  ) //  private readonly sedEventService: ClientService,
  {
  }

  async aggregateData(groupByField, sortCriteria) {
    try {
      return await this.reviewModel.aggregate([
        {$match: {public: true}},
        {
          $group: {
            _id: groupByField,
            count: {$sum: 1},
          },
        },
        {$sort: sortCriteria},
      ]);
    } catch (error) {
      console.error("Error in aggregateData:", error);
      throw error; // Re-throw the error for the caller to handle
    }
  }

  // Find multiple reviews
  // NOTE If user is set, it allows to choose whether to return public or private reviews
  // NOTE If user is not set, it returns only public ones


  generateShortId(length: number): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let result = '';
    const bytes = randomBytes(length);

    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }

    return result;
  }

  // @Cache({key:'Searche results'})
  async findAll(
      query: { skip: number; limit: number; text: string; public: boolean; filter?: string },
      sort: { by: string; asc: boolean },
      user?: User
  ) {
    if (user?.roles == Role.Admin) {
      if (user?.organisation == "biocomp") {
        console.log("first condition");

        // Apply aggregation function to model
        const data = this.reviewModel.aggregate([
          // Add flattened sections' fields
          {
            $set: {
              fields: {
                // Turn array of fields into an object
                $arrayToObject: {
                  // Concatenate all fields together
                  $reduce: {
                    input: {
                      $map: {
                        // Get only sections in object
                        input: {
                          $filter: {
                            input: {$objectToArray: "$$ROOT"},
                            as: "param",
                            cond: {
                              $in: [
                                "$$param.k",
                                [
                                  "publication",
                                  "dataset",
                                  "model",
                                  "optimization",
                                  "evaluation",
                                ],
                              ],
                            },
                          },
                        },
                        // Map section to array of fields
                        as: "section",
                        in: {
                          $map: {
                            // Input is the list of filtered key-value pairs
                            input: {
                              $objectToArray: "$$section.v",
                              // $filter: {
                              //     // Get all fields in the section
                              //     input: {$objectToArray: '$$section.v'},
                              //     as: 'field',
                              //     cond: {
                              //         // Skip DOME scores fields
                              //         $not: {$in: ["$$field.k", ['skip', 'done']]},
                              //     }
                              // }
                            },
                            // Update field key with section key
                            as: "field",
                            in: {
                              k: {$concat: ["$$section.k", "/", "$$field.k"]},
                              v: "$$field.v",
                            },
                          },
                        },
                      },
                    },
                    initialValue: [],
                    in: {$concatArrays: ["$$this", "$$value"]},
                  },
                },
              },
            },
          },
          // Add flattened sections' fields
          {
            $set: {
              matches: {
                $cond: {
                  // Check if query text is set
                  if: {$eq: [query.text, ""]},
                  // If not, avoid searching
                  then: null,
                  // Otherwise, search for matching fields
                  else: {
                    // Turn array of fields into an object
                    $arrayToObject: {
                      $filter: {
                        // Get all fields in current annotation
                        input: {$objectToArray: "$fields"},
                        as: "field",
                        cond: this.buildMatchCondition(query.text, query.filter)
                      },
                    },
                  },
                },
              },
            },
          },
          // Define number of
          {
            $set: {
              // Define number of valid fields
              done: {
                // Compute the sum of skipped fields
                $reduce: {
                  input: {
                    // Retrieve only number of skipped fields
                    $map: {
                      input: {
                        $filter: {
                          // Get all fields in current annotation
                          input: {$objectToArray: "$fields"},
                          as: "field",
                          cond: {
                            $regexMatch: {
                              input: "$$field.k",
                              regex: ".*done$",
                              options: "i",
                            },
                          },
                        },
                      },
                      as: "field",
                      in: "$$field.v",
                    },
                  },
                  initialValue: 0,
                  in: {$add: ["$$value", "$$this"]},
                },
              },
              // Define number of invalid fields
              skip: {
                // Compute the sum of skipped fields
                $reduce: {
                  input: {
                    // Retrieve only number of skipped fields
                    $map: {
                      input: {
                        $filter: {
                          // Get all fields in current annotation
                          input: {$objectToArray: "$fields"},
                          as: "field",
                          cond: {
                            $regexMatch: {
                              input: "$$field.k",
                              regex: ".*skip$",
                              options: "i",
                            },
                          },
                        },
                      },
                      as: "field",
                      in: "$$field.v",
                    },
                  },
                  initialValue: 0,
                  in: {$add: ["$$value", "$$this"]},
                },
              },
            },
          },
          // Compute total score
          {
            $set: {
              score: {
                $round: [
                  {$divide: ["$done", {$add: ["$done", "$skip"]}]},
                  2,
                ],
              },
            },
          },
          // Remove useless fields
          {
            $project: {
              // Keep these fields
              _id:1,
              created: 1,
              updated: 1,
              user: 1,
              uuid: 1,
              public: 1,
              publication: 1,
              score: 1,
              shortid: 1,
              // Remove these fields
              fields: "$$REMOVE",
              done: "$$REMOVE",
              skip: "$$REMOVE",
              // Eventually, remove matches
              matches: {
                $cond: [{$ne: ["$matches", null]}, "$matches", "$$REMOVE"],
              },
            },
          },
          {
            $match: {
              // 'publication.journal': user.organisation

              $and: [
                // keep public and private reviews
                {
                  $or: [
                    // Keep public reviews
                    {public: true},
                    // Keep private reviews (organization only only)
                    {public: false},
                  ],
                },
                // Filter reviews according to input query
                {public: query.public},
              ],
            },
          },

          {
            $match: {
              $expr: {
                // Filter according to text (if set)
                $or: [
                  // Case text search is set, then return only matching reviews
                  {
                    $and: [
                      {$ne: [query.text, ""]},
                      {$ne: [{$ifNull: ["$matches", {}]}, {}]},
                    ],
                  },
                  // Case text search is not set, then return all reviews
                  {$eq: [query.text, ""]},
                ],
              },
            },
          },
          // Remove user information
          //here is it

          // Sort according to sort variable
          {$sort: {[sort.by]: sort.asc ? 1 : -1, '_id':-1}},
          // First, upper bound results
          {$limit: query.skip + query.limit},
          // Then, apply lower bound
          {$skip: query.skip},
        ]);

        // console.log(JSON.stringify(data.pipeline()));
        return data;
      } else {
        console.log("Admin user is not from biocomp");

        // Apply aggregation function to model
        const data = this.reviewModel.aggregate([
          // Add flattened sections' fields
          {
            $set: {
              fields: {
                // Turn array of fields into an object
                $arrayToObject: {
                  // Concatenate all fields together
                  $reduce: {
                    input: {
                      $map: {
                        // Get only sections in object
                        input: {
                          $filter: {
                            input: {$objectToArray: "$$ROOT"},
                            as: "param",
                            cond: {
                              $in: [
                                "$$param.k",
                                [
                                  "publication",
                                  "dataset",
                                  "model",
                                  "optimization",
                                  "evaluation",
                                ],
                              ],
                            },
                          },
                        },
                        // Map section to array of fields
                        as: "section",
                        in: {
                          $map: {
                            // Input is the list of filtered key-value pairs
                            input: {
                              $objectToArray: "$$section.v",
                              // $filter: {
                              //     // Get all fields in the section
                              //     input: {$objectToArray: '$$section.v'},
                              //     as: 'field',
                              //     cond: {
                              //         // Skip DOME scores fields
                              //         $not: {$in: ["$$field.k", ['skip', 'done']]},
                              //     }
                              // }
                            },
                            // Update field key with section key
                            as: "field",
                            in: {
                              k: {$concat: ["$$section.k", "/", "$$field.k"]},
                              v: "$$field.v",
                            },
                          },
                        },
                      },
                    },
                    initialValue: [],
                    in: {$concatArrays: ["$$this", "$$value"]},
                  },
                },
              },
            },
          },
          // Add flattened sections' fields
          {
            $set: {
              matches: {
                $cond: {
                  // Check if query text is set
                  if: {$eq: [query.text, ""]},
                  // If not, avoid searching
                  then: null,
                  // Otherwise, search for matching fields
                  else: {
                    // Turn array of fields into an object
                    $arrayToObject: {
                      $filter: {
                        // Get all fields in current annotation
                        input: {$objectToArray: "$fields"},
                        as: "field",
                        cond: this.buildMatchCondition(query.text, query.filter),
                      },
                    },
                  },
                },
              },
            },
          },
          // Define number of
          {
            $set: {
              // Define number of valid fields
              done: {
                // Compute the sum of skipped fields
                $reduce: {
                  input: {
                    // Retrieve only number of skipped fields
                    $map: {
                      input: {
                        $filter: {
                          // Get all fields in current annotation
                          input: {$objectToArray: "$fields"},
                          as: "field",
                          cond: {
                            $regexMatch: {
                              input: "$$field.k",
                              regex: ".*done$",
                              options: "i",
                            },
                          },
                        },
                      },
                      as: "field",
                      in: "$$field.v",
                    },
                  },
                  initialValue: 0,
                  in: {$add: ["$$value", "$$this"]},
                },
              },
              // Define number of invalid fields
              skip: {
                // Compute the sum of skipped fields
                $reduce: {
                  input: {
                    // Retrieve only number of skipped fields
                    $map: {
                      input: {
                        $filter: {
                          // Get all fields in current annotation
                          input: {$objectToArray: "$fields"},
                          as: "field",
                          cond: {
                            $regexMatch: {
                              input: "$$field.k",
                              regex: ".*skip$",
                              options: "i",
                            },
                          },
                        },
                      },
                      as: "field",
                      in: "$$field.v",
                    },
                  },
                  initialValue: 0,
                  in: {$add: ["$$value", "$$this"]},
                },
              },
            },
          },
          // Compute total score
          {
            $set: {
              score: {
                $round: [
                  {$divide: ["$done", {$add: ["$done", "$skip"]}]},
                  2,
                ],
              },
            },
          },
          // Remove useless fields
          {
            $project: {
              // Keep these fields
              created: 1,
              updated: 1,
              user: 1,
              uuid: 1,
              public: 1,
              publication: 1,
              score: 1,
              shortid: 1,
              // Remove these fields
              fields: "$$REMOVE",
              done: "$$REMOVE",
              skip: "$$REMOVE",
              // Eventually, remove matches
              matches: {
                $cond: [{$ne: ["$matches", null]}, "$matches", "$$REMOVE"],
              },
            },
          },

          {
            $match: {
              // 'publication.journal': user.organisation

              $and: [
                // Match public reviews (any user) and private ones (current user)
                {
                  $or: [
                    // Keep public reviews
                    {public: true},
                    // Keep private reviews (organization only only)
                    {public: false, "publication.journal": {$in: user.organizations}},
                  ],
                },
                // Filter reviews according to input query
                {public: query.public},
              ],
            },
          },

          // $and: [
          //     // Match public reviews (any user) and private ones (current user)
          //     {
          //         $or: [
          //             // Keep public reviews
          //             { 'public': true },
          //             // Keep private reviews (current user only)
          //             { 'public': false, 'user': new Types.ObjectId(user && user._id) },
          //         ]
          //     },
          //     // Filter reviews according to input query
          //     { 'public': query.public }
          // ]

          // Match public or private entries

          // // { $match :{
          // //     $and:[
          // //         {
          // //             'user.organisation':{$ne:'undefined'}

          // //         },
          // //         {
          // //             'publication.journal':user.organisation
          // //         }

          // //     ]
          // // }

          // },

          // Match query text
          {
            $match: {
              $expr: {
                // Filter according to text (if set)
                $or: [
                  // Case text search is set, then return only matching reviews
                  {
                    $and: [
                      {$ne: [query.text, ""]},
                      {$ne: [{$ifNull: ["$matches", {}]}, {}]},
                    ],
                  },
                  // Case text search is not set, then return all reviews
                  {$eq: [query.text, ""]},
                ],
              },
            },
          },
          // Remove user information
          //here is it

          // Sort according to sort variable
          {$sort: {[sort.by]: sort.asc ? 1 : -1}},
          // First, upper bound results
          {$limit: query.skip + query.limit},
          // Then, apply lower bound
          {$skip: query.skip},
        ]);


        return data;
      }
    } else {
      //console.log("The logged in user is:" + user);
      console.log("the logged user is not an admin");
      // Apply aggregation function to model

      const data = this.reviewModel.aggregate([
        // Add flattened sections' fields
        {
          $set: {
            fields: {
              // Turn array of fields into an object
              $arrayToObject: {
                // Concatenate all fields together
                $reduce: {
                  input: {
                    $map: {
                      // Get only sections in object
                      input: {
                        $filter: {
                          input: {$objectToArray: "$$ROOT"},
                          as: "param",
                          cond: {
                            $in: [
                              "$$param.k",
                              [
                                "publication",
                                "dataset",
                                "model",
                                "optimization",
                                "evaluation",
                              ],
                            ],
                          },
                        },
                      },
                      // Map section to array of fields
                      as: "section",
                      in: {
                        $map: {
                          // Input is the list of filtered key-value pairs
                          input: {
                            $objectToArray: "$$section.v",
                            // $filter: {
                            //     // Get all fields in the section
                            //     input: {$objectToArray: '$$section.v'},
                            //     as: 'field',
                            //     cond: {
                            //         // Skip DOME scores fields
                            //         $not: {$in: ["$$field.k", ['skip', 'done']]},
                            //     }
                            // }
                          },
                          // Update field key with section key
                          as: "field",
                          in: {
                            k: {$concat: ["$$section.k", "/", "$$field.k"]},
                            v: "$$field.v",
                          },
                        },
                      },
                    },
                  },
                  initialValue: [],
                  in: {$concatArrays: ["$$this", "$$value"]},
                },
              },
            },
          },
        },
        // Add flattened sections' fields
        {
          $set: {
            matches: {
              $cond: {
                // Check if query text is set
                if: {$eq: [query.text, ""]},
                // If not, avoid searching
                then: null,
                // Otherwise, search for matching fields
                else: {
                  // Turn array of fields into an object
                  $arrayToObject: {
                    $filter: {
                      // Get all fields in current annotation
                      input: {$objectToArray: "$fields"},
                      as: "field",
                      cond: this.buildMatchCondition(query.text, query.filter),
                    },
                  },
                },
              },
            },
          },
        },
        // Define number of
        {
          $set: {
            // Define number of valid fields
            done: {
              // Compute the sum of skipped fields
              $reduce: {
                input: {
                  // Retrieve only number of skipped fields
                  $map: {
                    input: {
                      $filter: {
                        // Get all fields in current annotation
                        input: {$objectToArray: "$fields"},
                        as: "field",
                        cond: {
                          $regexMatch: {
                            input: "$$field.k",
                            regex: ".*done$",
                            options: "i",
                          },
                        },
                      },
                    },
                    as: "field",
                    in: "$$field.v",
                  },
                },
                initialValue: 0,
                in: {$add: ["$$value", "$$this"]},
              },
            },
            // Define number of invalid fields
            skip: {
              // Compute the sum of skipped fields
              $reduce: {
                input: {
                  // Retrieve only number of skipped fields
                  $map: {
                    input: {
                      $filter: {
                        // Get all fields in current annotation
                        input: {$objectToArray: "$fields"},
                        as: "field",
                        cond: {
                          $regexMatch: {
                            input: "$$field.k",
                            regex: ".*skip$",
                            options: "i",
                          },
                        },
                      },
                    },
                    as: "field",
                    in: "$$field.v",
                  },
                },
                initialValue: 0,
                in: {$add: ["$$value", "$$this"]},
              },
            },
          },
        },
        // Compute total score
        {
          $set: {
            score: {
              $round: [{$divide: ["$done", {$add: ["$done", "$skip"]}]}, 2],
            },
          },
        },
        // Remove useless fields
        {
          $project: {
            // Keep these fields
            _id:1,
            created: 1,
            updated: 1,
            user: 1,
            uuid: 1,
            public: 1,
            publication: 1,
            score: 1,
            shortid: 1,
            // Remove these fields
            fields: "$$REMOVE",
            done: "$$REMOVE",
            skip: "$$REMOVE",
            // Eventually, remove matches
            matches: {
              $cond: [{$ne: ["$matches", null]}, "$matches", "$$REMOVE"],
            },
          },
        },
        // Match public or private entries
        {
          $match: {
            $and: [
              // Match public reviews (any user) and private ones (current user)
              {
                $or: [
                  // Keep public reviews
                  {public: true},
                  // Keep private reviews (current user only)
                  {public: false, user: new Types.ObjectId(user && user._id)},
                ],
              },
              // Filter reviews according to input query
              {public: query.public},
            ],
          },
        },
        // Match query text
        {
          $match: {
            $expr: {
              // Filter according to text (if set)
              $or: [
                // Case text search is set, then return only matching reviews
                {
                  $and: [
                    {$ne: [query.text, ""]},
                    {$ne: [{$ifNull: ["$matches", {}]}, {}]},
                  ],
                },
                // Case text search is not set, then return all reviews
                {$eq: [query.text, ""]},
              ],
            },
          },
        },
        // Remove user information
        //here is it
        {$project: {user: 0}},
        // Sort according to sort variable
        {$sort: {[sort.by]: sort.asc ? 1 : -1, '_id':-1}},
        // First, upper bound results
        {$limit: query.skip + query.limit},
        // Then, apply lower bound
        {$skip: query.skip},
      ]);

      const pipeline = data.pipeline();
      writeFileSync('/tmp/agg.json', JSON.stringify(pipeline, null, 2));
      return data;
    }
  }

  private buildMatchCondition(text: string, filter?: string) {
    const conditions = [];

    // Always exclude skip/done fields
    conditions.push({
      $not: {
        $regexMatch: {
          input: "$$field.k",
          regex: ".*(skip|done)$",
          options: "i"
        }
      }
    });

    if (filter && filter !== 'all') {
      const filterMap = {
        'title': 'publication/title',
        'authors': 'publication/authors',
        'publication': 'publication/journal',
        'tags': 'publication/tags'
      };

      // First match the field we're filtering on
      conditions.push({
        $regexMatch: {
          input: "$$field.k",
          regex: `^${filterMap[filter]}$`,
          options: "i"
        }
      });

      // Then add the appropriate value matching condition
      if (filter === 'tags') {
        // Special handling for tags array
        conditions.push({
          $gt: [
            {
              $size: {
                $filter: {
                  input: "$$field.v",
                  as: "tag",
                  cond: {
                    $regexMatch: {
                      input: "$$tag",
                      regex: text,
                      options: "i"
                    }
                  }
                }
              }
            },
            0
          ]
        });
      } else {
        // Normal string matching for other fields
        conditions.push({
          $regexMatch: {
            input: "$$field.v",
            regex: text,
            options: "i"
          }
        });
      }
    } else {
      // When no filter is specified, search all fields
      conditions.push({
        $or: [
          // Match normal string fields
          {
            $and: [
              {
                $not: {
                  $regexMatch: {
                    input: "$$field.k",
                    regex: ".*tags$",
                    options: "i"
                  }
                }
              },
              {
                $regexMatch: {
                  input: "$$field.v",
                  regex: text,
                  options: "i"
                }
              }
            ]
          },
          // Match tags array
          {
            $and: [
              {
                $regexMatch: {
                  input: "$$field.k",
                  regex: ".*tags$",
                  options: "i"
                }
              },
              {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: "$$field.v",
                        as: "tag",
                        cond: {
                          $regexMatch: {
                            input: "$$tag",
                            regex: text,
                            options: "i"
                          }
                        }
                      }
                    }
                  },
                  0
                ]
              }
            ]
          }
        ]
      });
    }

    return {$and: conditions};
  }

  //**----------Publish the review--------*//

  async makePublic(iden: string, user: User) {
    //if()
    const filter = {uuid: iden};
    const update = {public: "true"};
    if (user.roles == Role.Admin) {
      try {
        const updatedDocument = await this.reviewModel.findOneAndUpdate(
            filter,
            {$set: {public: true}},
            {new: true}
        );
        return updatedDocument;
      } catch (error) {
        console.error("Error updating document:", error);
        throw error;
      }
    }
  }

  //** retrieve one specific review */
  async findOne(uuid: string) {
    // Retrieve review
    return await this.reviewModel
        // Filter review with given UUI
        .findOne({uuid})
        // .populate("user")
        .exec();
  }

  //** retrieve one specific review with shortid  */
  async findOneShortid(shortid: string) {
    // Retrieve review
    return await this.reviewModel
        // Filter review with given UUI
        .findOne({shortid: shortid})
        // .populate("user")
        .exec();
  }

  async create(review: Partial<Review>, user: User) {
    //Define the shortid

    // Define creation and update date
    const created = Date.now();
    const updated = created;
    // Define unique identifier
    const uuid = randomUUID();
    const shortid = this.generateShortId(10);
    // Update review
    review = Object.assign(review, {
      shortid,
      uuid,
      user,
      updated,
      created,
      public: false,
    });
    // Fill database with given review
    const inserted = new this.reviewModel(review);
    // Compute score for each section
    let score = computeDomeScore(inserted.toObject() as Review);
    // Remove total score
    score.delete("total");
    // Loop through each section
    score.forEach(([done, skip], section) => {
      // Update section
      review[section]["done"] = done;
      review[section]["skip"] = skip;
    });

    // Store review into database
    //return await inserted.save();

    const response = {
      review: await inserted.save(),
      callback: async () => {
        await this.eventEmitter.emitAsync(ReviewCreatedEvent.name, new ReviewCreatedEvent(inserted, user))
      }
    }
    return response;
  }

  async update(review: Partial<Review>): Promise<Review> {


    if (!review.shortid || !review.uuid) {
      throw new BadRequestException('shortid and uuid are required');
    }


    // Define update time
    const updated = Date.now();
    // Compute DOME score
    let score = computeDomeScore(review as any);
    // Remove total score
    score.delete("total");
    // Loop through each section
    score.forEach(([done, skip], section) => {
      // Update section
      review[section]["done"] = done;
      review[section]["skip"] = skip;
    });
    // Just update document, no other action is required
    // NOTE An user can update only its own reviews
    // NOTE Only private reviews can be updated
    return this.reviewModel.findOneAndUpdate(
        // Get only searched and allowed review
        {shortid: review.shortid, uuid: review.uuid, private: true},
        // Use input values to update review
        Object.assign({}, review, {updated}),
        // Return updated review
        {
          new: true,
          lean: true
        }).then(result => {
      if (!result) {
        throw new NotFoundException('review is not found or authorized');
      }
      return result;
    });
  }

  // Remove document according to given UUID
  async remove(uuid: string, user2: User) {
    // NOTE Only owner user or the admin can delete its own private reviews


    try {
      let deletedReview;
      let rev;
      if (this.isAdmin(user2)) {
        deletedReview = await this.reviewModel.findOneAndDelete({uuid});
      } else {
        console.log('second condition to delete the review for user');
        rev = await this.reviewModel.findOne({uuid, public: false});
        console.log(rev);
        deletedReview = await this.reviewModel.findOneAndDelete({uuid, public: false, user: user2});
      }

      return !!deletedReview;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw new HttpException('Failed to delete review', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  private isAdmin(user: User): boolean {
    // Assuming roles are stored as an array in the User object
    return user.roles.includes(Role.Admin);
  }

  // Count public annotations
  async countPub(): Promise<number> {
    const bn = await this.reviewModel.countDocuments({public: true});
    return bn;
  }

  // Count private annotations
  async countprivate(): Promise<number> {
    const bn = await this.reviewModel.countDocuments({public: false});
    return bn;
  }

  // Count all the annotations
  async contAll(): Promise<number> {
    const bn = await this.reviewModel.countDocuments();
    return bn;
  }


  // get the Annotations counts form the Database
  async getAnnotationsC() {
    return this.aggregateData(
        {$trim: {input: "$publication.year"}}, // Group by trimmed year
        {_id: -1} // Sort by year in descending order
    );
  }

  // get and group the journals names and sort them with higher annotations
  async getJournalsName() {
    return this.aggregateData(
        "$publication.journal", // Group by journal name
        {count: -1} // Sort by count in descending order
    );
  }

  // get and group the dataset score and sort them with higher score
  async getScoreDataset() {
    return this.aggregateData(
        "$dataset.done", // Group by dataset score
        {_id: -1} // Sort by count in descending order
    );
  }

  // get and group the optimization score and sort them with higher score
  async getScoreOptimization() {
    return this.aggregateData(
        "$optimization.done", // Group by dataset score
        {_id: -1} // Sort by count in descending order
    );
  }

  // get and group the evaluation score and sort them with higher score
  async getScoreEvaluation() {
    return this.aggregateData(
        "$evaluation.done", // Group by dataset score
        {_id: -1} // Sort by count in descending order
    );
  }

  // get and group the model score and sort them with higher score
  async getScoreModel() {
    return this.aggregateData(
        "$model.done", // Group by dataset score
        {_id: -1} // Sort by count in descending order
    );
  }

  // get and group the overall score and sort them with higher score
  async getScoreOverall() {
    return this.aggregateData(
        "$score", // Group by dataset score
        {_id: -1} // Sort by count in descending order
    );
  }


// APi Curon function for bulk submission
  async APICuronAll() {
    return this.reviewModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $unwind: {
          path: "$owner",
        },
      },
      {
        $match: {
          "owner.orcid": {$exists: true},
          public: true,
        },
      },
      {
        $project: {
          _id: 0,
          timestamp: "$updated",
          curator_orcid: "$owner.orcid",
          entity_uri: {
            $concat: ["https://registry.dome-ml.org/review/", "$shortid"],
          },
        },
      },
    ]);
  }




  async FetchAll() {

  return this.reviewModel.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: {  path: "$user", preserveNullAndEmptyArrays: true },
    },
  ])


 
  }

async fetchTenLatestReviews() {
  //_id somewhere 
  return this.reviewModel.aggregate([
    {
      $match: { public: true }, // Only public reviews
    },
    {
      $sort: { "publication.year": -1 , "_id":-1}, // Sort by creation date in descending order
    },
    {
      $limit: 10, // Limit to the 10 most recent reviews
    },
    {
      $project: {
        _id: 1,
        title: "$publication.title",
        authors: "$publication.authors",
        shortid: 1,
        journal: "$publication.journal",
        year: "$publication.year",
        created: 1,
        score: 1,
      },
    },
  ]);
}






}
