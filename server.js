const express = require("express");
const session = require("express-session");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const db = require("./db");
const { secret } = require("./jwt-secret");

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
app.use(express.static(path.join(__dirname + "/css/")))

let currentUser;
const currentOnline = [];
const saltRounds = 10;

const authTest = (req, res, next) => {
  if (!req.cookies.token) {
    console.log("No token supplied. Redirecting");
    res.redirect("/");
  } else {
    jwt.verify(req.cookies.token, secret, (err, decoded) => {
      if (err) {
        console.log("Token authentication failed:", err);
        res.clearCookie("token");
        console.log("Try again");
        res.redirect("/");
      } else {
        currentUser = decoded.login;
        next();
      }
    });
  }
}

const checkTokenAndRedirect = (req, res, login, password) => {
  if (!req.cookies.token) {
    const token = jwt.sign({ login, password }, secret, { expiresIn: "6h" });

    if (!token) {
      console.log("JWT signing error ocurred");
    }

    res.cookie("token", token, { httpOnly: true });
    currentUser = login;

    console.log("Token signed");
    res.redirect("./chat");
  } else {
    jwt.verify(req.cookies.token, secret, { maxAge: "1h" }, (err, decoded) => {
      if (err) {
        console.log("JWT verifying error occured:", err);
        res.clearCookie("token");
        console.log("Try again");
        res.redirect("/");
      } else {
        currentUser = decoded.login;
        res.redirect("./chat");
      }
    });
  }
}

app.get("/", (_, res) => {
  res.render("index", {
    layout: false,
  })
});

app.post("/login", async (req, res) => {
  const { login, password } = req.body;

  const user = await db.getUser(login);

  if (!user) {
    res.send("Invalid credentials");
  } else {
    const isPassCorrect = await bcrypt.compare(password, user.password);

    if (!isPassCorrect) {
      res.send("Invalid credentials");
    } else {
      checkTokenAndRedirect(req, res, login, password);
    }
  }
});

app.get("/register-page", (_, res) => {
  res.render("registration", {
    layout: false,
  });
});

app.post("/register", async (req, res) => {
  const { login } = req.body;

  const password = await bcrypt.hash(req.body.password, saltRounds);

  if (!password) {
    console.log("Registration error:", error);
  }
  db.addUser(login, password);
  const token = jwt.sign({ login, password }, secret, { expiresIn: "6h" });

  if (!token) {
    console.log("JWT signing error ocurred");
  }

  res.cookie("token", token, { httpOnly: true });
  res.redirect("/");
});

app.get("/chat", authTest, async (_, res) => {
  const chatHistory = await db.getChatHistory();

  if (!chatHistory) {
    console.log("Error retrieving chat history");
  }

  res.render("chat", {
    layout: false,
    currentUsername: currentUser,
    chatHistory,
    host,
    port,
  });
});

app.get("/logout", (_, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

const host = process.env.SERVER_HOST || `http://localhost`
const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Server running at port ${port}`);
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

    for (let i = 0; i < currentOnline.length; i++) {
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
