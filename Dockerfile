# Use Node.js 18 as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Install python and build tools required for some npm packages
RUN apk add --no-cache python3 make g++

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Create necessary directories
RUN mkdir -p server public/uploads/videos public/uploads/thumbnails

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]