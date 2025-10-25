// Centralized configuration with sensible defaults for development
export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:4173,http://164.90.236.138:5173,http://164.90.236.138").split(","),
  jwtSecret: process.env.JWT_SECRET || "dev_super_secret_change_me",
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: 120, // 120 requests/minute per IP
  },
};


