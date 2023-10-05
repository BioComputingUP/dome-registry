import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Types, Model, Query, QueryOptions, mongo } from "mongoose";
import { v4 as UUID } from "uuid";

import { Review, ReviewDocument } from "./review.schema";
import { User, UserDocument } from "../user/user.schema";
import { computeDomeScore } from "dome-registry-core"

@Injectable()
export class ReviewService {

    // Dependency injection
    constructor(
        @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) {
    }

    // Find multiple reviews
    // NOTE If user is set, it allows to choose whether to return public or private reviews
    // NOTE If user is not set, it returns only public ones
    async findAll(query: { skip: number, limit: number, text: string, public: boolean }, sort: { by: string, asc: boolean }, user?: User) {

        // Apply aggregation function to model
        return this.reviewModel.aggregate([
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
                                                input: { $objectToArray: '$$ROOT' },
                                                as: 'param',
                                                cond: { $in: ['$$param.k', ['publication', 'dataset', 'model', 'optimization', 'evaluation']] }
                                            }
                                        },
                                        // Map section to array of fields
                                        as: 'section',
                                        in: {
                                            $map: {
                                                // Input is the list of filtered key-value pairs
                                                input: {
                                                    $objectToArray: '$$section.v',
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
                                                as: 'field',
                                                in: {
                                                    k: { $concat: ['$$section.k', '/', '$$field.k'] },
                                                    v: '$$field.v'
                                                },
                                            },
                                        }
                                    }
                                },
                                initialValue: [],
                                in: { $concatArrays: ['$$this', '$$value'] }
                            }
                        }
                    }
                }
            },
            // Add flattened sections' fields
            {
                $set: {
                    matches: {
                        $cond: {
                            // Check if query text is set
                            if: { $eq: [query.text, ''] },
                            // If not, avoid searching
                            then: null,
                            // Otherwise, search for matching fields
                            else: {
                                // Turn array of fields into an object
                                $arrayToObject: {
                                    $filter: {
                                        // Get all fields in current annotation
                                        input: { $objectToArray: '$fields' },
                                        as: 'field',
                                        cond: {
                                            $and: [
                                                {
                                                    // Skip DOME scores fields
                                                    // NOTE It must be run before regex match
                                                    $not: { $regexMatch: { input: '$$field.k', regex: '.*(skip|done)$', options: 'i' } },
                                                },
                                                {
                                                    // Match query text by regex
                                                    // NOTE this is not efficient, would it much better to have an index on text
                                                    // https://stackoverflow.com/questions/10610131/checking-if-a-field-contains-a-string
                                                    $regexMatch: { input: '$$field.v', regex: query.text, options: 'i' }
                                                },

                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
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
                                            input: { $objectToArray: '$fields' },
                                            as: 'field',
                                            cond: {
                                                $regexMatch: { input: '$$field.k', regex: '.*done$', options: 'i' }
                                            }
                                        }
                                    },
                                    as: 'field',
                                    in: '$$field.v'
                                }
                            },
                            initialValue: 0,
                            in: { $add: ['$$value', '$$this'] }
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
                                            input: { $objectToArray: '$fields' },
                                            as: 'field',
                                            cond: {
                                                $regexMatch: { input: '$$field.k', regex: '.*skip$', options: 'i' }
                                            }
                                        }
                                    },
                                    as: 'field',
                                    in: '$$field.v'
                                }
                            },
                            initialValue: 0,
                            in: { $add: ['$$value', '$$this'] }
                        },
                    }
                }
            },
            // Compute total score
            { $set: { score: { $round: [{ $divide: ['$done', { $add: ['$done', '$skip'] }] }, 2] } } },
            // Remove useless fields
            {
                $project: {
                    // Keep these fields
                    created: 1, updated: 1, user: 1, uuid: 1, public: 1, publication: 1, score: 1,
                    // Remove these fields
                    fields: '$$REMOVE', done: '$$REMOVE', skip: '$$REMOVE',
                    // Eventually, remove matches
                    matches: { $cond: [{ $ne: ['$matches', null] }, '$matches', '$$REMOVE'] }
                }
            },
            // Match public or private entries
            {
                $match: {
                    $and: [
                        // Match public reviews (any user) and private ones (current user)
                        {
                            $or: [
                                // Keep public reviews
                                { 'public': true },
                                // Keep private reviews (current user only
                                { 'public': false, 'user': new Types.ObjectId(user && user._id) },
                            ]
                        },
                        // Filter reviews according to input query
                        { 'public': query.public }
                    ]
                }
            },
            // Match query text
            {
                $match: {
                    $expr: {
                        // Filter according to text (if set)
                        $or: [
                            // Case text search is set, then return only matching reviews
                            { $and: [{ $ne: [query.text, ''] }, { $ne: [{ $ifNull: ['$matches', {}] }, {}] }] },
                            // Case text search is not set, then return all reviews
                            { $eq: [query.text, ''] },
                        ],
                    }
                }
            },
            // Remove user information
            { $project: { user: 0 } },
            // Sort according to sort variable
            { $sort: { [sort.by]: sort.asc ? 1 : -1 } },
            // First, upper bound results
            { $limit: query.skip + query.limit },
            // Then, apply lower bound
            { $skip: query.skip },
        ]);
    }

    async findOne(uuid: string) {
        // Retrieve review
        return await this.reviewModel
            // Filter review with given UUI
            .findOne({ uuid })
            // .populate("user")
            .exec();
    }

    async create(review: Partial<Review>, user: User) {
        // Define creation and update date
        const created = Date.now();
        const updated = created;
        // Define unique identifier
        const uuid = UUID();
        // Update review
        review = Object.assign(review, { uuid, user, updated, created, public: false });
        // Fill database with given review
        const inserted = new this.reviewModel(review);
        // Compute score for each section
        let score = computeDomeScore(inserted.toObject() as Review);
        // Remove total score
        score.delete('total');
        // Loop through each section
        score.forEach(([done, skip], section) => {
            // Update section
            review[section]['done'] = done;
            review[section]['skip'] = skip;
        });
        // Store review into database
        return inserted.save();
    }

    async update(review: Partial<Review>, user: User) {
        // Define update time
        let updated = Date.now();
        // Compute DOME score
        let score = computeDomeScore(review as any);
        // Remove total score
        score.delete('total');
        // Loop through each section
        score.forEach(([done, skip], section) => {
            // Update section
            review[section]['done'] = done;
            review[section]['skip'] = skip;
        });
        // Just update document, no other action is required
        // NOTE An user can update only its own reviews
        // NOTE Only private reviews can be updated
        return this.reviewModel.findOneAndUpdate(
            // Get only searched and allowed review
            { uuid: review.uuid, user, public: false },
            // Use input values to update review
            Object.assign({}, review, { updated }),
            // Return updated review
            { new: true },
        );
    }

    // Remove document according to given UUID
    async remove(uuid: string, user: User) {
        // NOTE Only owner user can delete its own private reviews
        return this.reviewModel.findOneAndDelete(
            //  Get only searched and allowed review
            { uuid, user, public: false },
        );
    }

    // Count public reviews 
    async countPub(): Promise<number> {
        const bn = await this.reviewModel.count({ public: true });
        return bn;
    }


    // Count private reviews
    async countprivate(): Promise<number> {
        const bn = await this.reviewModel.count({ public: false });
        return bn;
    }



    // Create a new review threw Dome wizards 


    async createWizard(review: Partial<Review>) {
        // Define creation and update date 
        const creatd = Date.now();
        const updated = creatd;
        console.log(creatd);
        const uuid = UUID();
        review = Object.assign(review, { uuid, updated, creatd, public: false });
        const inserted = new this.reviewModel(review);
        let score = computeDomeScore(inserted.toObject() as Review);
        score.delete('totale');
        score.forEach(([done, skip], section) => {
            review[section]['done'] = done;
            review[section]['section'] = skip;
        });
        return inserted.save();

    }



}
