
import express from 'express';
import { joinEvent, getEventParticipants } from '../controllers/eventConnectionController';

const router = express.Router();

router.post('/join', joinEvent);
router.get('/:eventId/participants', getEventParticipants);

export default router;
