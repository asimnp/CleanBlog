const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const expressEdge = require("express-edge");
const fileUpload = require("express-fileupload");
const expressSession = require("express-session");
const connectMongo = require("connect-mongo");
const connectFlash = require("connect-flash");
const edge = require("edge.js");

const createPostController = require("./controllers/createPost");
const homePageController = require("./controllers/homePage");
const storePostController = require("./controllers/storePost");
const getPostController = require("./controllers/getPost");
const createUserController = require("./controllers/createUser");
const storeUserController = require("./controllers/storeUser");
const loginController = require("./controllers/login");
const loginUserController = require("./controllers/loginUser");
const logoutController = require("./controllers/logout");

// Express Init
const app = express();

// MongoDB Setup
mongoose.connect("mongodb://localhost/node-js-blog", { useNewUrlParser: true });

// Connect flash
app.use(connectFlash());

// MongoStore
const mongoStore = connectMongo(expressSession);

// Express Session
app.use(
  expressSession({
    secret: "secret",
    store: new mongoStore({
      mongooseConnection: mongoose.connection
    })
  })
);

// Model
const Post = require("./database/models/Post");

// File upload
app.use(fileUpload());

// Express Static Files
app.use(express.static("public"));

// Edge template engine
app.use(expressEdge);
app.set("views", `${__dirname}/views`);

// Global Middleware
app.use("*", (req, res, next) => {
  edge.global("auth", req.session.userId);
  next();
});

// Express Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware route
const auth = require("./middleware/auth");
const storePost = require("./middleware/storePost");
const registerIfAuthenticated = require("./middleware/registerIfAuthenticated");

// @type - GET
// @route - /
// @desc - Display home page
app.get("/", homePageController);

// @type - GET
// @route - /post/:id
// @desc - Display single post
app.get("/post/:id", getPostController);

// @type - GET
// @route - /posts/new
// @desc - Display create post page
app.get("/posts/new", auth, createPostController);

// @type - POST
// @route - /posts/store
// @desc - Register new
app.post("/posts/store", auth, storePost, storePostController);

// @type - GET
// @route - /auth/register
// @desc - Display user register page
app.get("/auth/register", registerIfAuthenticated, createUserController);

// @type - POST
// @route - /users/register
// @desc - Register new
app.post("/users/register", registerIfAuthenticated, storeUserController);

// @type - GET
// @route - /auth/login
// @desc - Display login page
app.get("/auth/login", registerIfAuthenticated, loginController);

// @type - POST
// @route - /users/login
// @desc - Login user
app.post("/users/login", registerIfAuthenticated, loginUserController);

// @type - GET
// @route - /auth/logout
// @desc - Logout user
app.get("/auth/logout", auth, logoutController);

app.use((req, res) => res.render("not-found"));

// listen & port setup
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running at port ${port}...`));
