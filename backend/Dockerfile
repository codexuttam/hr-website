FROM node:22-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Expose port (assuming 5000 based on Next.js env config)
EXPOSE 5000

# Start the Node.js server
CMD ["npm", "start"]
