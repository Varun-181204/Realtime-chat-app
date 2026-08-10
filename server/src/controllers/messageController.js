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
      console.log("Original Name:", document.originalname);
      console.log("Mime Type:", document.mimetype);
      console.log("Size:", document.size);
      console.log("Buffer Length:", document.buffer.length);
      console.log("==============================");

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "RealtimeChat/Documents",
            resource_type: "raw",
            use_filename: true,
            unique_filename: false,
            overwrite: false,
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
    });

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
    }).sort({ createdAt: 1 });

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