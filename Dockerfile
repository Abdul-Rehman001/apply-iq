# ── Stage 1: Dependencies ──────────────────────────────
# Start from official Node.js 18 on Alpine Linux
# Alpine is a tiny Linux distro (~5MB vs ~900MB for Ubuntu)
# This keeps your image small and fast to download
FROM node:20-alpine AS deps

# Set the working directory inside the container
# All commands after this run from /app
WORKDIR /app

# Copy ONLY package files first
# Why? Docker caches each step. If package.json hasn't changed,
# Docker skips npm install on next build — saves minutes
COPY package.json package-lock.json ./

# Install dependencies
# --frozen-lockfile = never update lockfile, exact versions only
RUN npm ci --frozen-lockfile

# ── Stage 2: Builder ───────────────────────────────────
# Start fresh from Node again
# Copy deps from Stage 1 (this is called multi-stage build)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of your source code
COPY . .

# Build the Next.js app for production
# This creates the .next folder with optimized output
RUN npm run build

# ── Stage 3: Runner ────────────────────────────────────
# Final image — only what's needed to RUN the app
# Not the build tools, not the source code
FROM node:20-alpine AS runner

WORKDIR /app

# Don't run as root inside container — security best practice
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built output from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership
USER nextjs

# Tell Docker this container listens on port 3000
EXPOSE 3000

# The command that runs when container starts
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]