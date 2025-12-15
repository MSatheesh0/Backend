
import { Request, Response } from 'express';
import EventConnection from '../models/EventConnection';
import { Event } from '../models/Event';

export const joinEvent = async (req: Request, res: Response) => {
    try {
        console.log('📥 Join Event Request Received');
        console.log('   - Body:', JSON.stringify(req.body));
        console.log('   - Headers:', JSON.stringify(req.headers));

        const { eventId, participantId } = req.body;

        console.log('   - Extracted eventId:', eventId);
        console.log('   - Extracted participantId:', participantId);

        // Validate inputs
        if (!eventId || !participantId) {
            console.log('❌ Validation failed: Missing eventId or participantId');
            return res.status(400).json({ message: 'Event ID and Participant ID are required' });
        }

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            console.log('❌ Event not found:', eventId);
            return res.status(404).json({ message: 'Event not found' });
        }

        const organizerId = event.createdBy;

        // Check if already joined
        const existingConnection = await EventConnection.findOne({ eventId, participantId });
        if (existingConnection) {
            console.log('⚠️ User already joined this event');
            return res.status(400).json({ message: 'User already joined this event' });
        }

        const newConnection = new EventConnection({
            eventId,
            organizerId,
            participantId,
        });

        await newConnection.save();
        console.log('✅ Event connection created successfully');

        res.status(201).json({ message: 'Successfully joined event', connection: newConnection });
    } catch (error) {
        console.error('❌ Error joining event:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getEventParticipants = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const connections = await EventConnection.find({ eventId }).populate('participantId', 'name email photoUrl');
        res.status(200).json(connections);
    } catch (error) {
        console.error('Error fetching participants:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
