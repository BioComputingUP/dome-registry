import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID, randomBytes } from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReviewNew, computeDomeScorerNew } from 'dome-registry-core';
import { User } from '../user/user.schema';
import { ReviewNewSchema, ReviewNewDocument, ReviewNewModel } from './new-review.schema';
import { Role } from '../roles/role.enum';
import { writeFileSync } from 'fs';

@Injectable()
export class ReviewNewService {
  constructor(
    @InjectModel(ReviewNewModel.name) private reviewNewModel: Model<ReviewNewDocument>,
    @InjectModel(User.name) private userModel: Model<any>,
    private eventEmitter: EventEmitter2
  ) {}

  async aggregateData(groupByField: any, sortCriteria: any) {
    try {
      return await this.reviewNewModel.aggregate([
        { $match: { public: true } },
        {
          $group: {
            _id: groupByField,
            count: { $sum: 1 },
          },
        },
        { $sort: sortCriteria },
      ]);
    } catch (error) {
      console.error('Error in aggregateData:', error);
      throw error;
    }
  }

  generateShortId(length: number): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let result = '';
    const bytes = randomBytes(length);

    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }

    return result;
  }

  async findAll(
    query: { skip: number; limit: number; text: string; public: boolean; filter?: string; isAiGenerated?: boolean },
    sort: { by: string; asc: boolean },
    user?: User
  ) {
    if (user?.roles == Role.Admin) {
      if (user?.organisation == 'biocomp') {
        console.log('first condition');

        const data = this.reviewNewModel.aggregate([
          {
            $set: {
              fields: {
                $arrayToObject: {
                  $reduce: {
                    input: {
                      $map: {
                        input: {
                          $filter: {
                            input: { $objectToArray: '$$ROOT' },
                            as: 'param',
                            cond: {
                              $in: [
                                '$$param.k',
                                ['publication', 'data', 'model', 'optimization', 'evaluation'],
                              ],
                            },
                          },
                        },
                        as: 'section',
                        in: {
                          $map: {
                            input: {
                              $objectToArray: '$$section.v',
                            },
                            as: 'field',
                            in: {
                              k: { $concat: ['$$section.k', '/', '$$field.k'] },
                              v: '$$field.v',
                            },
                          },
                        },
                      },
                    },
                    initialValue: [],
                    in: { $concatArrays: ['$$this', '$$value'] },
                  },
                },
              },
            },
          },
          {
            $set: {
              matches: {
                $cond: {
                  if: { $eq: [query.text, ''] },
                  then: null,
                  else: {
                    $arrayToObject: {
                      $filter: {
                        input: { $objectToArray: '$fields' },
                        as: 'field',
                        cond: this.buildMatchCondition(query.text, query.filter),
                      },
                    },
                  },
                },
              },
            },
          },
          {
            $set: {
              done: {
                $reduce: {
                  input: {
                    $map: {
                      input: {
                        $filter: {
                          input: { $objectToArray: '$fields' },
                          as: 'field',
                          cond: {
                            $regexMatch: {
                              input: '$$field.k',
                              regex: '.*done$',
                              options: 'i',
                            },
                          },
                        },
                      },
                      as: 'field',
                      in: '$$field.v',
                    },
                  },
                  initialValue: 0,
                  in: { $add: ['$$value', '$$this'] },
                },
              },
              skip: {
                $reduce: {
                  input: {
                    $map: {
                      input: {
                        $filter: {
                          input: { $objectToArray: '$fields' },
                          as: 'field',
                          cond: {
                            $regexMatch: {
                              input: '$$field.k',
                              regex: '.*skip$',
                              options: 'i',
                            },
                          },
                        },
                      },
                      as: 'field',
                      in: '$$field.v',
                    },
                  },
                  initialValue: 0,
                  in: { $add: ['$$value', '$$this'] },
                },
              },
            },
          },
          {
            $set: {
              score: {
                $round: [{ $divide: ['$done', { $add: ['$done', '$skip'] }] }, 2],
              },
            },
          },
          {
            $project: {
              _id: 1,
              created: 1,
              updated: 1,
              user: 1,
              uuid: 1,
              public: 1,
              publication: 1,
              score: 1,
              shortid: 1,
              isAiGenerated: 1,
              fields: '$$REMOVE',
              done: '$$REMOVE',
              skip: '$$REMOVE',
              matches: {
                $cond: [{ $ne: ['$matches', null] }, '$matches', '$$REMOVE'],
              },
            },
          },
          {
            $match: {
              $and: [
                { public: query.public },
                { isAiGenerated: query.isAiGenerated },
              ],
            },
          },
          {
            $match: {
              $expr: {
                $or: [
                  {
                    $and: [
                      { $ne: [query.text, ''] },
                      { $ne: [{ $ifNull: ['$matches', {}] }, {}] },
                    ],
                  },
                  { $eq: [query.text, ''] },
                ],
              },
            },
          },
          { $project: { user: 0 } },
          { $sort: { [sort.by]: sort.asc ? 1 : -1, _id: -1 } },
          { $limit: query.skip + query.limit },
          { $skip: query.skip },
        ]);

        const pipeline = data.pipeline();
        writeFileSync('/tmp/agg_new.json', JSON.stringify(pipeline, null, 2));
        return data;
      } else {
        console.log('Admin but not biocomp');

        const data = this.reviewNewModel.aggregate([
          {
            $set: {
              fields: {
                $arrayToObject: {
                  $reduce: {
                    input: {
                      $map: {
                        input: {
                          $filter: {
                            input: { $objectToArray: '$$ROOT' },
                            as: 'param',
                            cond: {
                              $in: [
                                '$$param.k',
                                ['publication', 'data', 'model', 'optimization', 'evaluation'],
                              ],
                            },
                          },
                        },
                        as: 'section',
                        in: {
                          $map: {
                            input: {
                              $objectToArray: '$$section.v',
                            },
                            as: 'field',
                            in: {
                              k: { $concat: ['$$section.k', '/', '$$field.k'] },
                              v: '$$field.v',
                            },
                          },
                        },
                      },
                    },
                    initialValue: [],
                    in: { $concatArrays: ['$$this', '$$value'] },
                  },
                },
              },
            },
          },
          {
            $set: {
              matches: {
                $cond: {
                  if: { $eq: [query.text, ''] },
                  then: null,
                  else: {
                    $arrayToObject: {
                      $filter: {
                        input: { $objectToArray: '$fields' },
                        as: 'field',
                        cond: this.buildMatchCondition(query.text, query.filter),
                      },
                    },
                  },
                },
              },
            },
          },
          {
            $set: {
              done: {
                $reduce: {
                  input: {
                    $map: {
                      input: {
                        $filter: {
                          input: { $objectToArray: '$fields' },
                          as: 'field',
                          cond: {
                            $regexMatch: {
                              input: '$$field.k',
                              regex: '.*done$',
                              options: 'i',
                            },
                          },
                        },
                      },
                      as: 'field',
                      in: '$$field.v',
                    },
                  },
                  initialValue: 0,
                  in: { $add: ['$$value', '$$this'] },
                },
              },
              skip: {
                $reduce: {
                  input: {
                    $map: {
                      input: {
                        $filter: {
                          input: { $objectToArray: '$fields' },
                          as: 'field',
                          cond: {
                            $regexMatch: {
                              input: '$$field.k',
                              regex: '.*skip$',
                              options: 'i',
                            },
                          },
                        },
                      },
                      as: 'field',
                      in: '$$field.v',
                    },
                  },
                  initialValue: 0,
                  in: { $add: ['$$value', '$$this'] },
                },
              },
            },
          },
          {
            $set: {
              score: {
                $round: [{ $divide: ['$done', { $add: ['$done', '$skip'] }] }, 2],
              },
            },
          },
          {
            $project: {
              _id: 1,
              created: 1,
              updated: 1,
              user: 1,
              uuid: 1,
              public: 1,
              publication: 1,
              score: 1,
              shortid: 1,
              isAiGenerated: 1,
              fields: '$$REMOVE',
              done: '$$REMOVE',
              skip: '$$REMOVE',
              matches: {
                $cond: [{ $ne: ['$matches', null] }, '$matches', '$$REMOVE'],
              },
            },
          },
          {
            $match: {
              $and: [
                { public: query.public },
                { isAiGenerated: query.isAiGenerated },
              ],
            },
          },
          {
            $match: {
              $expr: {
                $or: [
                  {
                    $and: [
                      { $ne: [query.text, ''] },
                      { $ne: [{ $ifNull: ['$matches', {}] }, {}] },
                    ],
                  },
                  { $eq: [query.text, ''] },
                ],
              },
            },
          },
          { $project: { user: 0 } },
          { $sort: { [sort.by]: sort.asc ? 1 : -1, _id: -1 } },
          { $limit: query.skip + query.limit },
          { $skip: query.skip },
        ]);

        const pipeline = data.pipeline();
        writeFileSync('/tmp/agg_new.json', JSON.stringify(pipeline, null, 2));
        return data;
      }
    } else {
      console.log('the logged user is not an admin');

      const data = this.reviewNewModel.aggregate([
        {
          $set: {
            fields: {
              $arrayToObject: {
                $reduce: {
                  input: {
                    $map: {
                      input: {
                        $filter: {
                          input: { $objectToArray: '$$ROOT' },
                          as: 'param',
                          cond: {
                            $in: [
                              '$$param.k',
                              ['publication', 'data', 'model', 'optimization', 'evaluation'],
                            ],
                          },
                        },
                      },
                      as: 'section',
                      in: {
                        $map: {
                          input: {
                            $objectToArray: '$$section.v',
                          },
                          as: 'field',
                          in: {
                            k: { $concat: ['$$section.k', '/', '$$field.k'] },
                            v: '$$field.v',
                          },
                        },
                      },
                    },
                  },
                  initialValue: [],
                  in: { $concatArrays: ['$$this', '$$value'] },
                },
              },
            },
          },
        },
        {
          $set: {
            matches: {
              $cond: {
                if: { $eq: [query.text, ''] },
                then: null,
                else: {
                  $arrayToObject: {
                    $filter: {
                      input: { $objectToArray: '$fields' },
                      as: 'field',
                      cond: this.buildMatchCondition(query.text, query.filter),
                    },
                  },
                },
              },
            },
          },
        },
        {
          $set: {
            done: {
              $reduce: {
                input: {
                  $map: {
                    input: {
                      $filter: {
                        input: { $objectToArray: '$fields' },
                        as: 'field',
                        cond: {
                          $regexMatch: {
                            input: '$$field.k',
                            regex: '.*done$',
                            options: 'i',
                          },
                        },
                      },
                    },
                    as: 'field',
                    in: '$$field.v',
                  },
                },
                initialValue: 0,
                in: { $add: ['$$value', '$$this'] },
              },
            },
            skip: {
              $reduce: {
                input: {
                  $map: {
                    input: {
                      $filter: {
                        input: { $objectToArray: '$fields' },
                        as: 'field',
                        cond: {
                          $regexMatch: {
                            input: '$$field.k',
                            regex: '.*skip$',
                            options: 'i',
                          },
                        },
                      },
                    },
                    as: 'field',
                    in: '$$field.v',
                  },
                },
                initialValue: 0,
                in: { $add: ['$$value', '$$this'] },
              },
            },
          },
        },
        {
          $set: {
            score: {
              $round: [{ $divide: ['$done', { $add: ['$done', '$skip'] }] }, 2],
            },
          },
        },
        {
          $project: {
            _id: 1,
            created: 1,
            updated: 1,
            user: 1,
            uuid: 1,
            public: 1,
            publication: 1,
            score: 1,
            shortid: 1,
            isAiGenerated: 1,
            fields: '$$REMOVE',
            done: '$$REMOVE',
            skip: '$$REMOVE',
            matches: {
              $cond: [{ $ne: ['$matches', null] }, '$matches', '$$REMOVE'],
            },
          },
        },
        {
          $match: {
            $and: [
              {
                $or: [
                  { public: true },
                  { public: false, user: new Types.ObjectId(user && user._id) },
                ],
              },
              { public: query.public },
              { isAiGenerated: query.isAiGenerated },
            ],
          },
        },
        {
          $match: {
            $expr: {
              $or: [
                {
                  $and: [
                    { $ne: [query.text, ''] },
                    { $ne: [{ $ifNull: ['$matches', {}] }, {}] },
                  ],
                },
                { $eq: [query.text, ''] },
              ],
            },
          },
        },
        { $project: { user: 0 } },
        { $sort: { [sort.by]: sort.asc ? 1 : -1, _id: -1 } },
        { $limit: query.skip + query.limit },
        { $skip: query.skip },
      ]);

      const pipeline = data.pipeline();
      writeFileSync('/tmp/agg_new.json', JSON.stringify(pipeline, null, 2));
      return data;
    }
  }

  private buildMatchCondition(text: string, filter?: string) {
    const conditions = [];

    conditions.push({
      $not: {
        $regexMatch: {
          input: '$$field.k',
          regex: '.*(skip|done)$',
          options: 'i',
        },
      },
    });

    if (filter && filter !== 'all') {
      const filterMap = {
        title: 'publication/title',
        authors: 'publication/authors',
        publication: 'publication/journal',
        tags: 'publication/tags',
      };

      conditions.push({
        $regexMatch: {
          input: '$$field.k',
          regex: `^${filterMap[filter]}$`,
          options: 'i',
        },
      });

      if (filter === 'tags') {
        conditions.push({
          $gt: [
            {
              $size: {
                $filter: {
                  input: '$$field.v',
                  as: 'tag',
                  cond: {
                    $regexMatch: {
                      input: '$$tag',
                      regex: text,
                      options: 'i',
                    },
                  },
                },
              },
            },
            0,
          ],
        });
      } else {
        conditions.push({
          $regexMatch: {
            input: '$$field.v',
            regex: text,
            options: 'i',
          },
        });
      }
    } else {
      conditions.push({
        $or: [
          {
            $and: [
              {
                $not: {
                  $regexMatch: {
                    input: '$$field.k',
                    regex: '.*tags$',
                    options: 'i',
                  },
                },
              },
              {
                $regexMatch: {
                  input: '$$field.v',
                  regex: text,
                  options: 'i',
                },
              },
            ],
          },
          {
            $and: [
              {
                $regexMatch: {
                  input: '$$field.k',
                  regex: '.*tags$',
                  options: 'i',
                },
              },
              {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: '$$field.v',
                        as: 'tag',
                        cond: {
                          $regexMatch: {
                            input: '$$tag',
                            regex: text,
                            options: 'i',
                          },
                        },
                      },
                    },
                  },
                  0,
                ],
              },
            ],
          },
        ],
      });
    }

    return { $and: conditions };
  }

  async makePublic(iden: string, user: User) {
    const filter = { uuid: iden };
    const update = { public: true };
    if (user.roles == Role.Admin) {
      try {
        return await this.reviewNewModel.findOneAndUpdate(filter, update, {
          new: true,
          lean: true,
        });
      } catch (error) {
        console.error('Error making review public:', error);
        throw error;
      }
    }
  }

  async findOne(uuid: string) {
    return await this.reviewNewModel.findOne({ uuid }).exec();
  }

  async findOneShortid(shortid: string) {
    return await this.reviewNewModel.findOne({ shortid }).exec();
  }

  async create(review: Partial<ReviewNew>, user: User) {
    const created = Date.now();
    const updated = created;
    const uuid = randomUUID();
    const shortid = this.generateShortId(10);

    review = Object.assign(review, {
      shortid,
      uuid,
      user,
      updated,
      created,
      public: false,
    });

    const inserted = new this.reviewNewModel(review);

    let score = computeDomeScorerNew(inserted.toObject() as ReviewNew);
    score.delete('total');

    score.forEach(([done, skip], section) => {
      review[section]['done'] = done;
      review[section]['skip'] = skip;
    });

    const response = {
      review: await inserted.save(),
      callback: async () => {
        await this.eventEmitter.emitAsync('ReviewNewCreated', {
          review: inserted,
          user,
        });
      },
    };
    return response;
  }

  async update(review: Partial<ReviewNew>): Promise<ReviewNew> {
    if (!review.shortid || !review.uuid) {
      throw new BadRequestException('shortid and uuid are required');
    }

    const updated = Date.now();
    let score = computeDomeScorerNew(review as any);
    score.delete('total');

    score.forEach(([done, skip], section) => {
      review[section]['done'] = done;
      review[section]['skip'] = skip;
    });

    return this.reviewNewModel
      .findOneAndUpdate(
        { shortid: review.shortid, uuid: review.uuid, public: false },
        Object.assign({}, review, { updated }),
        {
          new: true,
          lean: true,
        }
      )
      .then((result) => {
        if (!result) {
          throw new BadRequestException('Review not found or cannot be updated');
        }
        return result;
      });
  }

  async remove(uuid: string, user: User) {
    try {
      let deletedReview;

      if (this.isAdmin(user)) {
        deletedReview = await this.reviewNewModel.findOneAndDelete({
          uuid,
        });
      } else {
        deletedReview = await this.reviewNewModel.findOneAndDelete({
          uuid,
          user: new Types.ObjectId(user._id),
          public: false,
        });
      }

      return !!deletedReview;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw new HttpException(
        'Failed to delete review',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private isAdmin(user: User): boolean {
    return user.roles.includes(Role.Admin);
  }

  async countPub(): Promise<number> {
    return await this.reviewNewModel.countDocuments({ public: true });
  }

  async countPrivate(): Promise<number> {
    return await this.reviewNewModel.countDocuments({ public: false });
  }

  async countAll(): Promise<number> {
    return await this.reviewNewModel.countDocuments();
  }

  async getAnnotationsC() {
    return this.aggregateData(
      { $trim: { input: '$publication.year' } },
      { _id: -1 }
    );
  }

  async getJournalsName() {
    return this.aggregateData('$publication.journal', { count: -1 });
  }

  async getScoreData() {
    return this.aggregateData('$data.done', { _id: -1 });
  }

  async getScoreOptimization() {
    return this.aggregateData('$optimization.done', { _id: -1 });
  }

  async getScoreEvaluation() {
    return this.aggregateData('$evaluation.done', { _id: -1 });
  }

  async getScoreModel() {
    return this.aggregateData('$model.done', { _id: -1 });
  }

  async getScoreOverall() {
    return this.aggregateData('$score', { _id: -1 });
  }

  async APICuronAll() {
    return this.reviewNewModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'owner',
        },
      },
      {
        $unwind: {
          path: '$owner',
        },
      },
      {
        $match: {
          'owner.orcid': { $exists: true },
          public: true,
        },
      },
      {
        $project: {
          _id: 0,
          timestamp: '$updated',
          curator_orcid: '$owner.orcid',
          entity_uri: {
            $concat: ['https://registry.dome-ml.org/review-new/', '$shortid'],
          },
        },
      },
    ]);
  }

  async FetchAll() {
    return this.reviewNewModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: { path: '$user', preserveNullAndEmptyArrays: true },
      },
    ]);
  }

  async findOnePmid(pmid: string) {
    const review = await this.reviewNewModel
      .findOne({ 'publication.pmid': pmid, public: true })
      .exec();

    if (review && review.public) {
      return review;
    }

    return null;
  }

  async fetchTenLatestReviews() {
    return this.reviewNewModel.aggregate([
      {
        $match: { public: true },
      },
      {
        $sort: { 'publication.year': -1, _id: -1 },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 1,
          title: '$publication.title',
          authors: '$publication.authors',
          shortid: 1,
          journal: '$publication.journal',
          year: '$publication.year',
          created: 1,
          score: 1,
        },
      },
    ]);
  }
}
