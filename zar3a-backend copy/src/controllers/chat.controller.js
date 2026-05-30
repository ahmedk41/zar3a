import { ChatMessage, User, Notification } from '../models/index.js';
import { Op, fn, col, literal } from 'sequelize';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHAT CONTROLLER
 * Handles specialist chat messages (persistent storage)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * POST /chat/messages
 * Send a new chat message
 * Body: { receiverId, message, attachmentUrl? }
 */
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, attachmentUrl } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: 'receiverId is required' });
    }

    if (!message?.trim() && !attachmentUrl) {
      return res.status(400).json({ message: 'Message or attachmentUrl is required' });
    }

    // Check if receiver exists
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const chatMessage = await ChatMessage.create({
      senderId: req.user.id,
      receiverId,
      message: (message || '').trim(),
      attachmentUrl,
    });

    // Create a notification for the receiver
    await Notification.create({
      userId: receiverId,
      type: 'CHAT_MESSAGE',
      title: `New message from ${req.user.fullName || 'a user'}`,
      message: (message || 'Sent an attachment').substring(0, 200),
      createdBy: req.user.id,
    });

    // Populate relationships
    const populatedMessage = await ChatMessage.findByPk(chatMessage.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'fullName', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'fullName', 'email'] },
      ],
    });

    console.log(`✅ Message sent from ${req.user.email} to ${receiver.email}`);

    res.status(201).json({
      message: 'Message sent',
      data: populatedMessage,
    });
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /chat/messages/:conversationUserId
 * Get chat history with a specific user
 * Query: { page, limit }
 */
export const getChatHistory = async (req, res) => {
  try {
    const { conversationUserId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Check if conversation user exists
    const conversationUser = await User.findByPk(conversationUserId);
    if (!conversationUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get messages between current user and conversation user
    const { count, rows } = await ChatMessage.findAndCountAll({
      where: {
        [Op.or]: [
          {
            senderId: req.user.id,
            receiverId: conversationUserId,
          },
          {
            senderId: conversationUserId,
            receiverId: req.user.id,
          },
        ],
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'fullName', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'fullName', 'email'] },
      ],
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'ASC']],
    });

    // Mark received messages as read
    await ChatMessage.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          receiverId: req.user.id,
          senderId: conversationUserId,
          isRead: false,
        },
      }
    );

    res.status(200).json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit),
      messages: rows,
    });
  } catch (err) {
    console.error('getChatHistory error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /chat/conversations
 * Get all conversations (unique contacts)
 * Query: { page, limit }
 */
export const getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get all unique conversation partners
    const conversations = await ChatMessage.findAll({
      attributes: [
        'senderId',
        'receiverId',
        [fn('MAX', col('createdAt')), 'lastMessageAt'],
      ],
      where: {
        [Op.or]: [
          { senderId: req.user.id },
          { receiverId: req.user.id },
        ],
      },
      group: ['senderId', 'receiverId'],
      order: [[literal('MAX(createdAt)'), 'DESC']],
      raw: true,
      subQuery: false,
    });

    // Extract unique user IDs from conversations
    const userIds = new Set();
    conversations.forEach((conv) => {
      if (conv.senderId !== req.user.id) userIds.add(conv.senderId);
      if (conv.receiverId !== req.user.id) userIds.add(conv.receiverId);
    });

    // Get user details
    const users = await User.findAll({
      where: { id: { [Op.in]: Array.from(userIds) } },
      attributes: ['id', 'fullName', 'email', 'role'],
    });

    // Get unread message counts
    const unreadCounts = await ChatMessage.findAll({
      attributes: [
        'senderId',
        [fn('COUNT', col('id')), 'count'],
      ],
      where: {
        receiverId: req.user.id,
        isRead: false,
      },
      group: ['senderId'],
      raw: true,
    });

    const unreadMap = {};
    unreadCounts.forEach((item) => {
      unreadMap[item.senderId] = item.count;
    });

    const conversationList = users.map((user) => ({
      user,
      unreadCount: unreadMap[user.id] || 0,
    }));

    res.status(200).json({
      total: conversationList.length,
      conversations: conversationList.slice(offset, offset + parseInt(limit)),
    });
  } catch (err) {
    console.error('getConversations error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PUT /chat/messages/:messageId/read
 * Mark a single message as read
 */
export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await ChatMessage.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.receiverId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await message.update({ isRead: true, readAt: new Date() });

    res.status(200).json({ message: 'Message marked as read' });
  } catch (err) {
    console.error('markMessageAsRead error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * DELETE /chat/messages/:messageId
 * Delete a message (soft delete - mark as hidden)
 */
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await ChatMessage.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.senderId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await message.destroy();

    res.status(200).json({ message: 'Message deleted' });
  } catch (err) {
    console.error('deleteMessage error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /chat/messages/upload
 * Send a chat message with a file attachment (multipart/form-data)
 * Body: { receiverId, message? }  File field: attachment
 */
export const sendMessageWithAttachment = async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: 'receiverId is required' });
    }

    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const attachmentUrl = req.file ? `/uploads/chat/${req.file.filename}` : null;

    if (!message && !req.file) {
      return res.status(400).json({
        message: "Message or attachment is required",
      });
    }

    const chatMessage = await ChatMessage.create({
      senderId: req.user.id,
      receiverId,
      message: (message || '').trim() || '',
      attachmentUrl,
    });

    // Create a notification for the receiver
    await Notification.create({
      userId: receiverId,
      type: 'CHAT_MESSAGE',
      title: `New message from ${req.user.fullName || 'a user'}`,
      message: (message || 'Sent an attachment').substring(0, 200),
      createdBy: req.user.id,
    });

    const populatedMessage = await ChatMessage.findByPk(chatMessage.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'fullName', 'email'] },
        { model: User, as: 'receiver', attributes: ['id', 'fullName', 'email'] },
      ],
    });

    console.log(`✅ Message with attachment sent from ${req.user.email} to ${receiver.email}`);

    res.status(201).json({
      message: 'Message sent',
      data: populatedMessage,
    });
  } catch (err) {
    console.error('sendMessageWithAttachment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  sendMessage,
  sendMessageWithAttachment,
  getChatHistory,
  getConversations,
  markMessageAsRead,
  deleteMessage,
};
