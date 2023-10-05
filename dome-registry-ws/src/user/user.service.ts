import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {User, UserDocument} from "./user.schema";

@Injectable()
export class UserService {

    // Dependency injection
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    // Return user data according to ORCID identifier
    async findByOrcid(orcid: string) {
        return this.userModel.findOne({ orcid });
    }

    async findById(id: number) {
        return this.userModel.findById(id);
    }

    // Create or update user according to ORCID identifier
    async upsertByOrcid(user: Partial<User>) {
        // Just update document, no other action is required
        return this.userModel.findOneAndUpdate({orcid: user.orcid}, user, {new: true, upsert: true}).exec();
    }


    async counUsers():Promise<number>{
      
            const bn = await this.userModel.count({public:true});
            return bn; 
      }
}
