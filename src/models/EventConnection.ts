
import mongoose, { Schema, Document } from 'mongoose';

export interface IEventConnection extends Document {
    eventId: mongoose.Types.ObjectId;
    organizerId: mongoose.Types.ObjectId;
    participantId: mongoose.Types.ObjectId;
    joinedAt: Date;
}

const EventConnectionSchema: Schema = new Schema({
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IEventConnection>('EventConnection', EventConnectionSchema);
