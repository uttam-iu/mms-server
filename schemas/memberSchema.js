import mongoose from 'mongoose';

const memberAddSchema = mongoose.Schema({
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    status: { type: String, required: true },
    userId: { type: String, required: true ,default: Date.now()},
    createdAt: { type: String, default: Date.now() },
    updatedAt: { type: String, default: Date.now() },
})

const memberUpdateSchema = mongoose.Schema({
    fullName: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    status: { type: String, required: true },
    userId: { type: String, required: true },
    createdAt: { type: String },
    updatedAt: { type: String, default: Date.now() },
})

export const MemberCreateModel = mongoose?.models?.Member || mongoose.model('Member', memberAddSchema);
export const MemberUpdateModel = mongoose?.models?.Member || mongoose.model('Member', memberUpdateSchema);
export const MemberModel = mongoose?.models?.Member;
