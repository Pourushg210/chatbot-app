import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);

// Enable CORS
app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3003"],
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3001", "http://localhost:3003"],
    credentials: true,
  },
});

// Store connected users
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle authentication
  socket.on("authenticate", (data) => {
    const { userId, token } = data;
    connectedUsers.set(socket.id, { userId, token });
    console.log("User authenticated:", userId);
  });

  // Handle joining a conversation
  socket.on("join_conversation", (data) => {
    const { conversationId } = data;
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation: ${conversationId}`);
  });

  // Handle leaving a conversation
  socket.on("leave_conversation", (data) => {
    const { conversationId } = data;
    socket.leave(conversationId);
    console.log(`User ${socket.id} left conversation: ${conversationId}`);
  });

  // Handle sending messages
  socket.on("send_message", (message) => {
    console.log("Message received:", message);

    // Broadcast message to all users in the conversation
    socket.to(message.conversationId).emit("message", {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    });

    // Send delivery confirmation
    socket.emit("message_delivered", message.id);
  });

  // Handle typing indicators
  socket.on("typing", (data) => {
    const { conversationId, isTyping } = data;
    socket.to(conversationId).emit("typing", {
      userId: connectedUsers.get(socket.id)?.userId || "unknown",
      conversationId,
      isTyping,
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    connectedUsers.delete(socket.id);
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", connections: io.engine.clientsCount });
});

const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
