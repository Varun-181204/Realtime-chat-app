import Message from "../models/Message.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const sendMessage = async (req, res) => {
  try {
    const { receiver, message } = req.body;

    let imageUrl = "";
    let fileUrl = "";
    let fileName = "";
    let fileType = "";

    // =========================
    // DOCUMENT UPLOAD
    // =========================
    if (req.files?.document) {
      const document = req.files.document[0];

      console.log("========== DOCUMENT ==========");
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "RealtimeChat/Documents",
            resource_type: "raw",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        streamifier
          .createReadStream(document.buffer)
          .pipe(stream);
      });

      fileUrl = result.secure_url;
      fileName = document.originalname;
      fileType = document.mimetype;

      console.log("Cloudinary Document URL:", fileUrl);
    }

    // =========================
    // IMAGE UPLOAD
    // =========================
    if (req.files?.image) {
      const image = req.files.image[0];

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "RealtimeChat",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        streamifier
          .createReadStream(image.buffer)
          .pipe(stream);
      });

      imageUrl = result.secure_url;

      console.log("Cloudinary Image URL:", imageUrl);
    }

    // =========================
    // VALIDATION
    // =========================
    if (!receiver) {
      return res.status(400).json({
        success: false,
        message: "Receiver is required",
      });
    }

    if (!message?.trim() && !imageUrl && !fileUrl) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // =========================
    // SAVE MESSAGE
    // =========================
    const newMessage = await Message.create({
      sender: req.user.id,
      receiver,
      message: message || "",
      image: imageUrl,
      file: fileUrl,
      fileName,
      fileType,
      replyTo: replyTo || null,
    });

    await newMessage.populate("replyTo", "message sender image file fileName");

    console.log("========== NEW MESSAGE ==========");
    console.log(newMessage);
    console.log("=================================");

    // =========================
    // RESPONSE
    // =========================
    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// GET MESSAGES
// =========================

export const getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        {
          sender: req.user.id,
          receiver: receiverId,
        },
        {
          sender: receiverId,
          receiver: req.user.id,
        },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("replyTo", "message sender image file fileName");

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// =========================
// MARK MESSAGES AS SEEN
// =========================

export const markMessagesAsSeen = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const senderId = req.params.senderId;

    await Message.updateMany(
      {
        sender: senderId,
        receiver: currentUserId,
        seen: false,
      },
      {
        seen: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as seen",
    });
  } catch (error) {
    console.error("MARK SEEN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getUnreadCounts = async (req, res) => {
  try {
    const unreadMessages = await Message.find({
      receiver: req.user.id,
      seen: false,
    });

    const unreadCounts = {};

    unreadMessages.forEach((msg) => {
      const senderId = String(msg.sender);

      if (!unreadCounts[senderId]) {
        unreadCounts[senderId] = 0;
      }

      unreadCounts[senderId]++;
    });

    res.status(200).json({
      success: true,
      data: unreadCounts,
    });
  } catch (error) {
    console.error("GET UNREAD COUNTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only the sender can delete the message
    if (String(message.sender) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      messageId,
    });
  } catch (error) {
    console.error("DELETE MESSAGE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    const existingMessage = await Message.findById(messageId);

    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only the sender can edit the message
    if (
      String(existingMessage.sender) !==
      String(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own messages",
      });
    }

    // Only text messages can be edited
    if (existingMessage.image || existingMessage.file) {
      return res.status(400).json({
        success: false,
        message: "Only text messages can be edited",
      });
    }

    existingMessage.message = message.trim();

    await existingMessage.save();

    res.status(200).json({
      success: true,
      data: existingMessage,
    });
  } catch (error) {
    console.error("EDIT MESSAGE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getRecentConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user.userId;

    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    }).sort({ createdAt: -1 });

    const recent = {};

    messages.forEach((msg) => {
      const otherId =
        String(msg.sender) === String(currentUserId)
          ? String(msg.receiver)
          : String(msg.sender);

      if (!recent[otherId]) {
        recent[otherId] = {
          message: msg.message,
          image: !!msg.image,
          file: !!msg.file,
          fileName: msg.fileName,
          createdAt: msg.createdAt,
          sender: msg.sender,
        };
      }
    });

    res.status(200).json({
      success: true,
      data: recent,
    });
  } catch (error) {
    console.error("GET RECENT CONVERSATIONS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id || req.user.userId;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: "Emoji is required",
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (!message.reactions) {
      message.reactions = [];
    }

    const existingIndex = message.reactions.findIndex(
      (r) => String(r.user) === String(userId) && r.emoji === emoji
    );

    if (existingIndex > -1) {
      message.reactions.splice(existingIndex, 1);
    } else {
      const userPrevIndex = message.reactions.findIndex(
        (r) => String(r.user) === String(userId)
      );

      if (userPrevIndex > -1) {
        message.reactions[userPrevIndex].emoji = emoji;
      } else {
        message.reactions.push({ user: userId, emoji });
      }
    }

    await message.save();

    res.status(200).json({
      success: true,
      data: {
        messageId,
        reactions: message.reactions,
      },
    });
  } catch (error) {
    console.error("TOGGLE REACTION ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};