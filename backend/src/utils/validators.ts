import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Invalid email address format").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address format").toLowerCase(),
  password: z.string().min(1, "Password is required")
});

export const ScanUrlSchema = z.object({
  url: z.string().min(3, "URL is too short").max(2048, "URL exceeds maximum length of 2048 chars")
});

export const BatchScanSchema = z.object({
  urls: z.array(z.string().min(3).max(2048)).min(1, "At least one URL is required").max(500, "Maximum batch limit is 500 URLs")
});
