import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Role } from '../roles/role.enum';

export type UserDocument = User & mongoose.Document;

@Schema()
export class User {

    @Prop({ type: mongoose.Schema.Types.ObjectId })
    _id: number;

    // ORCID identifier
    @Prop({ type: String, unique: true, required: false })
    orcid?: string;

    // User's name (and surname)
    @Prop({ type: String, required: false })
    name?: string;

    // User email
    @Prop({ type: String, required: false })
    email?: string;

   // Role of the user 'user' By default 
    @Prop( {type: String, enum: Role , default: Role.User})
    roles?: string;

    // Organization of the user 
    @Prop({type:String, required:false , default:'undefined'})
    organisation?:string;
    
    //Multiple Organizations of the user
    @Prop({type:[String], required:false,default:['nothing']})
    organizations?:string[];


}

// Export schema
export const UserSchema = SchemaFactory.createForClass(User);
