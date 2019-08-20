// Dependencies
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");

// App Instantiation
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(express.static("public"));

// Mongo URI
const mongoURI =
  "mongodb+srv://rgactr:EwzsszElAulCxt63@bottomlesspit-1quus.mongodb.net/test?retryWrites=true&w=majority";

// Connect to Mongo
const connection = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true
});

// Init gfs (file system)
let gfs;

// Init stream
connection.once("open", () => {
  gfs = Grid(connection.db, mongoose.mongo);
  gfs.collection("uploads");
});

// Init storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          ownerId: req.user.id,
          bucketName: "uploads"
        };
        resolve(fileInfo);
      });
    });
  }
});

// Init Multer to set Req.file from form submission
const upload = multer({ storage });

// Paths
app.get("/", (req, res) => {
  gfs.files.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.render("index", { files: false });
    }
    return res.render("index", { files: true });
  });
});

app.get("/pictures", (req, res) => {
  gfs.files.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.render("index", { files: false });
    } else {
      files.map(file => {
        if (
          file.contentType === "image/jpeg" ||
          file.contentType === "image/png"
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });

      res.render("allPictures", { files: files });
    }
  });
});

app.get("/pictures/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No Picture Exists"
      });
    }
    if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: "Not an image"
      });
    }
  });
});

app.get("/upload", (req, res) => {
  res.render("upload");
});

app.post("/upload", upload.single("file"), (req, res) => {
  // res.json({ file: req.file})
  res.redirect("/pictures");
});

app.delete("/pictures/:_id", (req, res) => {
  gfs.remove({ _id: req.params._id, root: "uploads" }, (err, gridStore) => {
    if (err) {
      console.log("Error: ", err);
      return res.status(404).json({ err });
    }
    res.redirect("/pictures");
  });
});

// Server

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`App is listening on port: ${PORT}`);
});
