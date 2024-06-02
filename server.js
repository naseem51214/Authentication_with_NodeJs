import express from "express";
import mongoose from "mongoose";
import path from "path";
import multer from "multer";
import { User } from "./Models/Users.js";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dbaurgccv",
  api_key: "918612238218747",
  api_secret: "cCzTi3hO4BtIcMuFIxOSdscsRRE",
});

const app = express();

app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

mongoose
  .connect(
    "mongodb+srv://mailforthecloud1:NrXOhMpKKCmvaB7o@cluster0.kuhmw7m.mongodb.net/",
    {
      dbName: "demo",
    }
  )
  .then(() => console.log("mongoDB is connected"))
  .catch((error) => console.log(error));
// open register page
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// creat user
app.post("/register", upload.single("file"), async (req, res) => {
  const file = req.file.path;
  const { name, email, password } = req.body;
  try {
    const cloudinaryResponse = await cloudinary.uploader.upload(file, {
      folder: "NodeJs_Authentication",
    });
    console.log(cloudinaryResponse, name, email, password);

    let user = await User.create({
      profileImag: cloudinaryResponse.secure_url,
      name,
      email,
      password,
    });
    res.redirect("/");
  } catch (error) {
    res.send("error occured");
  }
});

// login user
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) res.render("login.ejs", { msg: "user not found" })
    else if (user.password != password) {
      res.render("login.ejs", { msg: "invalid password" });
    } else {
      res.render("profile.ejs", { user });
    }
  } catch (error) {
    res.send("error occurd");
  }
});
// users
app.get('/users',async(req,res)=>{

    let users =  await User.find().sort({createdAt:-1})
    res.render("users.ejs",{users})
})
// open login page
app.get("/", (req, res) => {
  res.render("login.ejs");
});

app.listen(1000, () => console.log("server is running on port 1000"));
