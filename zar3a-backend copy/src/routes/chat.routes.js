import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import authenticate from '../middlewares/authenticate.js';
import { uploadChatAttachment } from '../middlewares/upload.js';
import {
  sendMessage,
  sendMessageWithAttachment,
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
    body('message').optional({ checkFalsy: true }).trim(),
  ],
  validate,
  sendMessage
);

// File/image upload route (multipart/form-data)
router.post('/messages/upload', uploadChatAttachment, sendMessageWithAttachment);

router.get('/messages/:conversationUserId', getChatHistory);
router.get('/conversations', getConversations);
router.put('/messages/:messageId/read', markMessageAsRead);
router.delete('/messages/:messageId', deleteMessage);

export default router;
