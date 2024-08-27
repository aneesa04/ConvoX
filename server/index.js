const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const Message = require("./models/messageModel");
const userRouter = require("./routes/userRouter");
const homeRouter = require("./routes/homeRouter");
const messageRouter = require("./routes/messageRouter");
const errorController = require("./controllers/errorController");
const User = require("./models/userModel");

const groupRouter = require("./routes/groupRouter");
dotenv.config({ path: "./.env" });

const DB = process.env.DB_CONNECTION_STRING.replace(
  "<password>",
  process.env.DB_PASSWORD
);
const app = express(); //app is an instance of express
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"], // Allowed methods
    credentials: true, // Allow credentials such as cookies
  },
});
app.use(
  cors(
    {
      origin: ["http://localhost:5173"], // Your frontend origin
      credentials: true,
    } // Allows credentials (cookies) to be sent
  )
);

app.use(express.json());
app.use(cookieParser());
// Middleware to parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
  });
});

app.use("/api/users", userRouter);
app.use("/api/home", homeRouter);
app.use("/api/messages", messageRouter);
app.use("/api/groups", groupRouter);
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Not Found",
  });
});
app.use(errorController);

mongoose
  .connect(DB, {})
  .then(() => {
    console.log("Mongodb connected");

    if (process.env.NODE_ENV === "development") {
      server.listen(process.env.PORT, () => {
        console.log(`Server is listening on port ${process.env.PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error("DATABASE CONNECTION ERROR:", err);
    process.exit(1); //appication halting with an error
  });
const connectedUsers = [];
io.on("connection", async (socket) => {
  console.log("Connected to the server with id : ", socket.id);
  socket.broadcast.emit("new-connection");

  const userId = socket.handshake.query.userId; //user's mongo db id
  const user = await User.findByIdAndUpdate(userId, { $set: { active: true } });

  user.groupIds?.map((groupId) => {
    socket.join(groupId.toString());
  });

  connectedUsers.push({ userId, socketId: socket.id });

  socket.on("send-message", async (data) => {
    if (data.type === "individual") {
      await Message.create({
        sender: userId,
        receiver: data.to,
        message: data.message,
      });

      const receiver = connectedUsers.find((user) => user.userId === data.to);
      receiver && socket.to(receiver.socketId).emit("new-message");
    } else {
      await Message.create({
        sender: userId,
        groupId: data.to,
        message: data.message,
        isGroupMessage: true,
      });

      socket.to(data.to).emit("new-message");
    }
  });

  socket.on("added-new-user", ({ selectedUserId, userName }) => {
    const selectedUser = connectedUsers.find(
      (user) => user.userId === selectedUserId
    );

    selectedUser &&
      socket.to(selectedUser.socketId).emit("added-as-contact", userName);
  });

  socket.on(
    "group-creation",
    ({ userName, groupId, groupMembersIds, groupName }) => {
      socket.join(groupId);
      let user;
      groupMembersIds.forEach(async (member) => {
        user = connectedUsers.find((user) => user.userId === member);
        if(user)
          socket
            .to(user.socketId)
            .emit("added-to-group", { userName, groupId, groupName });
            else{
              await User.findByIdAndUpdate(member, {$push : {groupIds : groupId}})
            }
      });

    }
  );

  socket.on("join-room", ({ roomId }) => {
    socket.join(roomId);
  });
  socket.on("group-member-removed", ({ groupId, groupName, userId }) => {
    const user = connectedUsers.find((user) => user.userId === userId);
    const socketInstance = io.sockets.sockets.get(user?.socketId);
    if (socketInstance) {
      socketInstance.leave(groupId);
      socketInstance.emit("removed-from-group", groupName);
    }
  });

  socket.on("group-deleted", (groupId) => {
    socket.to(groupId).emit("group-deleted");
  });
  socket.on("disconnect", async () => {
    await User.findByIdAndUpdate(userId, {
      $set: { active: false },
    });
    connectedUsers.splice(
      connectedUsers.findIndex((user) => user.socketId === socket.id),
      1
    );
    console.log("Disconnect");
  });
});

module.exports = app;
