import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogsByTag,
} from "./routes/blogs";
import { uploadImage, deleteImage, uploadMiddleware } from "./routes/upload";
import { testSupabaseConnection } from "./routes/test-supabase";
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
} from "./routes/jobs";
import { downloadResume } from "./routes/files";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.get("/api/test-supabase", testSupabaseConnection);

  // Blog API routes
  app.get("/api/blogs", getAllBlogs);
  app.get("/api/blogs/:id", getBlogById);
  app.post("/api/blogs", createBlog);
  app.put("/api/blogs/:id", updateBlog);
  app.delete("/api/blogs/:id", deleteBlog);
  app.get("/api/blogs/tag/:tag", getBlogsByTag);

  // Job posting API routes
  app.get("/api/jobs", getAllJobs);
  app.get("/api/jobs/:id", getJobById);
  app.post("/api/jobs", createJob);
  app.put("/api/jobs/:id", updateJob);
  app.delete("/api/jobs/:id", deleteJob);
  app.patch("/api/jobs/:id/status", updateJobStatus);

  // Upload API routes
  app.post("/api/upload/image", uploadMiddleware, uploadImage);
  app.delete("/api/upload/image", deleteImage);

  // Serve uploaded images
  app.use("/api/uploads", express.static("uploads"));

  return app;
}
