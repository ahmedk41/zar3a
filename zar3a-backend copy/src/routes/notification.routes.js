import { Router } from 'express';
import { validationResult } from 'express-validator';
import authenticate from '../middlewares/authenticate.js';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
} from '../controllers/notification.controller.js';

const router = Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:notificationId/read', markNotificationAsRead);
router.put('/read-all', markAllNotificationsAsRead);
router.delete('/:notificationId', deleteNotification);

export default router;
