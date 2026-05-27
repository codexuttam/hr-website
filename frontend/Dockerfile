# ─── Build Stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Only NEXT_PUBLIC_* variables are needed at build time (they're inlined into the JS bundle).
# SUPABASE_SERVICE_ROLE_KEY is a server-side secret — it must NOT be baked into the image.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

# ─── Production Stage ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only the artifacts needed to run
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# SUPABASE_SERVICE_ROLE_KEY (and any other server-only secrets) are injected at
# container runtime via:
#   docker run -e SUPABASE_SERVICE_ROLE_KEY=<secret> ...
# or via a secrets manager / orchestrator (e.g. Docker Secrets, Kubernetes Secret,
# Azure Key Vault, AWS Secrets Manager).  They are NEVER embedded in the image.
CMD ["npm", "start"]
