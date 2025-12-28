
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import EventConnection from '../models/EventConnection';
import { Event } from '../models/Event';

/**
 * Toggle event participation - join or leave an event
 * POST /event-connections/toggle
 */
export const toggleEventParticipation = async (req: Request, res: Response) => {
    try {
        console.log('📥 Toggle Event Participation Request Received');
        console.log('   - Body:', JSON.stringify(req.body));

        const { eventId, participantId } = req.body;

        // Validate inputs
        if (!eventId || !participantId) {
            console.log('❌ Validation failed: Missing eventId or participantId');
            return res.status(400).json({
                success: false,
                message: 'Event ID and Participant ID are required'
            });
        }

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            console.log('❌ Event not found:', eventId);
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if already joined
        const existingConnection = await EventConnection.findOne({ eventId, participantId });

        if (existingConnection) {
            // User wants to leave the event
            await EventConnection.deleteOne({ _id: existingConnection._id });
            console.log('✅ User left the event');
            return res.status(200).json({
                success: true,
                message: 'Successfully left the event',
                isJoined: false
            });
        } else {
            // User wants to join the event
            const organizerId = event.createdBy;
            const newConnection = new EventConnection({
                eventId,
                organizerId,
                participantId,
            });

            await newConnection.save();
            console.log('✅ User joined the event');

            return res.status(200).json({
                success: true,
                message: 'Successfully joined the event',
                isJoined: true,
                connection: newConnection
            });
        }
    } catch (error) {
        console.error('❌ Error toggling event participation:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: (error as any).message
        });
    }
};

/**
 * Check if user has joined an event
 * GET /event-connections/check/:eventId/:participantId
 */
export const checkEventParticipation = async (req: Request, res: Response) => {
    try {
        const { eventId, participantId } = req.params;

        const connection = await EventConnection.findOne({ eventId, participantId });

        return res.status(200).json({
            success: true,
            isJoined: !!connection,
            connection: connection || null
        });
    } catch (error) {
        console.error('❌ Error checking event participation:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: (error as any).message
        });
    }
};

/**
 * Get all participants for an event
 * GET /event-connections/participants/:eventId
 */
export const getEventParticipants = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;

        // Validate event ID
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID format'
            });
        }

        const participants = await EventConnection.find({ eventId })
            .populate('participantId', 'name email photoUrl role company position')
            .sort({ joinedAt: -1 });

        return res.status(200).json({
            success: true,
            count: participants.length,
            participants: participants.map(p => ({
                ...p.toObject(),
                participant: p.participantId
            }))
        });
    } catch (error) {
        console.error('❌ Error fetching event participants:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch participants',
            error: (error as any).message
        });
    }
};
