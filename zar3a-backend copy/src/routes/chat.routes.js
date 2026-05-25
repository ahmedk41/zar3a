import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import authenticate from '../middlewares/authenticate.js';
import {
  sendMessage,
  getChatHistory,
  getConversations,
  markMessageAsRead,
  deleteMessage,
} from '../controllers/chat.controller.js';

const router = Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

router.use(authenticate);

router.post(
  '/messages',
  [
    body('receiverId').isInt().withMessage('Receiver ID is required'),
    body('message').trim().notEmpty().withMessage('Message text is required'),
  ],
  validate,
  sendMessage
);
router.get('/messages/:conversationUserId', getChatHistory);
router.get('/conversations', getConversations);
router.put('/messages/:messageId/read', markMessageAsRead);
router.delete('/messages/:messageId', deleteMessage);

export default router;
