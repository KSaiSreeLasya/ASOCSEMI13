import { RequestHandler } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${ext}`);
  },
});

// Configure multer for resume uploads
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const resumesDir = path.join(process.cwd(), "uploads", "resumes");
    if (!fs.existsSync(resumesDir)) {
      fs.mkdirSync(resumesDir, { recursive: true });
    }
    cb(null, resumesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `resume-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file && file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      console.warn(
        `❌ Rejected file upload: ${file?.originalname || "unknown"} (${file?.mimetype || "no mimetype"})`,
      );
      cb(null, false); // Reject file without throwing error
    }
  },
});

export const uploadMiddleware = upload.single("image");

// Image upload handler
export const uploadImage: RequestHandler = (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      console.warn("❌ Upload rejected: No valid image file provided");
      return res.status(400).json({
        success: false,
        error:
          "No valid image file provided. Please upload a valid image file (PNG, JPG, GIF, etc.)",
      });
    }

    // Verify file is an image
    if (!file.mimetype.startsWith("image/")) {
      console.warn(`❌ Upload rejected: Invalid file type ${file.mimetype}`);
      return res.status(400).json({
        success: false,
        error: "Only image files are allowed",
      });
    }

    // Return the URL where the image can be accessed
    const imageUrl = `/api/uploads/${file.filename}`;

    console.log(
      `✅ Image upload successful: ${file.originalname} -> ${file.filename}`,
    );

    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      },
    });
  } catch (error) {
    console.error("❌ Error uploading image:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload image",
    });
  }
};

// Delete uploaded image
export const deleteImage: RequestHandler = (req, res) => {
  try {
    const { url } = req.body;

    if (url && url.startsWith("/api/uploads/")) {
      const filename = path.basename(url);
      const filePath = path.join(uploadsDir, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted image: ${filename}`);
      }
    }

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete image",
    });
  }
};
