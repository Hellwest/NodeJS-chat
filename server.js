const express = require("express");
const session = require("express-session");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");
const db = require("./db");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    secret: "exp-sess",
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
  })
);
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

const secret = require("./jwtsecret").secret;
let currentUser;
let currentOnline = [];
const saltRounds = 10;

function authTest(req, res, next) {
  if (!req.cookies.token) {
    console.log("No token supplied. Redirecting");
    res.redirect("/");
  }

  const decoded = jwt.verify(req.cookies.token, secret);

  if (!decoded) {
    console.log("Token authentication failed");
    res.clearCookie("token");

    console.log("Try again");
    res.redirect("/");
  }

  console.log("Token verification successful (middleware)");
  currentUser = decoded.login;
  next();
}

function checkTokenAndRedirect(req, res, login, password) {
  if (!req.cookies.token) {
    const token = jwt.sign({ login, password }, secret, { expiresIn: "6h" });

    if (!token) {
      console.log("JWT signing error occured");
    }

    res.cookie("token", token, { httpOnly: true });
    currentUser = login;

    console.log("Token signed");
    res.redirect("./chat");
  } else {
    console.log("Trying to verify");
    const decoded = jwt.verify(req.cookies.token, secret, { maxAge: "1h" });

    if (!decoded) {
      res.clearCookie("token");

      console.log("Try again");
      res.redirect("/");
    }

    currentUser = decoded.login;

    console.log("Token verified");
    res.redirect("./chat");
  }
}

app.use("/", express.static(__dirname + "/"));

app.post("/login", async (req, res) => {
  const { login, password } = req.body;

  const result = await db.testLogin(login);

  if (!result) {
    res.send("User not found");
  } else {
    const isPassCorrect = await bcrypt.compare(password, result.password);

    if (!isPassCorrect) {
      res.send("Incorrect password");
    } else {
      checkTokenAndRedirect(req, res, login, password);
    }
  }
});

app.get("/register-page", (req, res) => {
  res.sendFile(path.join(__dirname + "/index-reg.html"));
});

app.post("/register", async (req, res) => {
  const login = req.body.login;

  const password = await bcrypt.hash(req.body.password, saltRounds);

  if (!password) {
    console.log("Registration error:", error);
  }

  db.addUser(login, password);
  const token = jwt.sign({ login, password }, secret, { expiresIn: "6h" });

  if (!token) {
    console.log("JWT signing error occured");
  }

  res.cookie("token", token, { httpOnly: true });
  res.redirect("/");
});

app.get("/chat", authTest, async (req, res) => {
  const result = await db.getChatHistory();

  if (!result) {
    console.log("Error retreiving chat history");
  }

  res.render("chat", {
    layout: false,
    currentUsername: currentUser,
    chatHistory: result,
    PORT
  });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});

// Socket.io

io.on("connection", socket => {
  let socketUser = currentUser;
  currentOnline.push(socketUser);

  console.log("User connected:", socketUser);
  console.log("Currently online:", currentOnline);

  io.emit("user-connected", socketUser);
  io.emit("onlineListUpdate", currentOnline);

  socket.on("message", msg => {
    console.log("Message sent:", msg.sender + ":", msg.text);
    db.storeMessage(socketUser, msg.text, msg.time);

    socket.broadcast.emit("message", {
      sender: msg.sender,
      time: msg.time,
      text: msg.text
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socketUser);

    for (var i = 0; i < currentOnline.length; i++) {
      if (currentOnline[i] === socketUser) {
        currentOnline.splice(i, 1);
        break;
      }
    }

    io.emit("user-disconnected", socketUser);
    io.emit("onlineListUpdate", currentOnline);

    console.log("Currently online:", currentOnline);
  });
});
