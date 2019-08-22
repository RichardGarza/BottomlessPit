module.exports = {
  init(app) {
    const express = require("express");
    const router = express.Router();
    const User = require("../db/models").User;
    const bcrypt = require("bcryptjs");
    const passport = require("passport");
    const path = require("path");
    const crypto = require("crypto");
    const mongoose = require("mongoose");
    const multer = require("multer");
    const GridFsStorage = require("multer-gridfs-storage");
    const Grid = require("gridfs-stream");
    const salt = bcrypt.genSaltSync();
    const mongoURI =
      "mongodb+srv://rgactr:EwzsszElAulCxt63@bottomlesspit-1quus.mongodb.net/test?retryWrites=true&w=majority";

    // Connect to MongoDB
    const connection = mongoose.createConnection(mongoURI, {
      useNewUrlParser: true
    });

    // Init gfs (GridFS file system)
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

            const filename =
              buf.toString("hex") + path.extname(file.originalname);

            let fileInfo;

            if (req.user) {
              fileInfo = {
                filename: filename,
                ownerId: req.user.id,
                bucketName: "uploads"
              };
            } else {
              fileInfo = {
                filename: filename,
                ownerId: 0,
                bucketName: "uploads"
              };
            }
            resolve(fileInfo);
          });
        });
      }
    });

    // Init Multer to set Req.file from form submission
    const upload = multer({ storage });

    // Paths
    router.get("/", (req, res) => {
      gfs.files.find().toArray((err, files) => {
        if (!files || files.length === 0) {
          return res.render("index", { files: false });
        }
        return res.render("index", { files: true });
      });
    });

    router.get("/sign-in", (req, res) => {
      res.render("sign-in");
    });

    router.get("/sign-up", (req, res) => {
      res.render("sign-up");
    });

    router.post("/sign-in", (req, res) => {
      passport.authenticate("local")(req, res, () => {
        if (!req.user) {
          req.flash("notice", "Sign in failed. Please try again.");
          res.redirect("/users/sign_in");
        } else {
          req.flash("notice", "You've successfully signed in!");
          res.redirect("/");
        }
      });
    });

    router.get("/sign-out", (req, res) => {
      console.log("FORKNAPKIN", req.user);
      req.logout();
      req.flash("notice", "You've successfully signed out!");
      res.redirect("/");
    });

    router.post("/sign-up", (req, res) => {
      // Make newUser object from request body.
      let newUser = {
        email: req.body.email,
        password: req.body.password
      };

      const hashedPassword = bcrypt.hashSync(newUser.password, salt);

      const callback = (err, user) => {
        // If there's an error, display it and redirect to sign up.
        if (err) {
          console.log(err);
          req.flash("error", err);
          res.redirect("/users/sign_up");
        } else {
          // If no error, authenticate.
          passport.authenticate("local", {
            successRedirect: "/",
            failureRedirect: "/sign-up"
          })(req, res, () => {
            req.flash(
              "notice",
              "You've successfully signed up, and you're signed in!"
            );
            res.redirect("/");
          });
        }
      };

      if (newUser.email === "admin@secretsaucyness.com") {
        return User.create({
          email: newUser.email,
          password: hashedPassword,
          role: "admin"
        })
          .then(user => {
            callback(null, user);
          })
          .catch(err => {
            callback(err);
          });
      } else {
        return User.create({
          email: newUser.email,
          password: hashedPassword,
          role: "member"
        })
          .then(user => {
            callback(null, user);
          })
          .catch(err => {
            callback(err);
          });
      }
    });

    router.get("/pictures", (req, res) => {
      gfs.files.find().toArray((err, files) => {
        if (!files || files.length === 0) {
          return res.render("index", { files: false });
        } else {
          let reverseFiles = [];
          files.map(file => {
            if (
              file.contentType === "image/jpeg" ||
              file.contentType === "image/png"
            ) {
              file.isImage = true;
            } else {
              file.isImage = false;
            }
            reverseFiles.unshift(file);
          });
          files = reverseFiles;
          res.render("allPictures", { files: files });
        }
      });
    });

    router.get("/pictures/:filename", (req, res) => {
      gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (!file || file.length === 0) {
          return res.status(404).json({ err: "No Picture Exists" });
        }
        if (
          file.contentType === "image/jpeg" ||
          file.contentType === "image/png"
        ) {
          const readstream = gfs.createReadStream(file.filename);
          readstream.pipe(res);
        } else {
          res.status(404).json({
            err: "Not an image"
          });
        }
      });
    });

    router.get("/upload", (req, res) => {
      res.render("upload");
    });

    router.get("/upload-failure", (req, res) => {
      res.render("upload-failure");
    });
    router.get("/upload-success", (req, res) => {
      res.render("upload-success");
    });

    router.post("/upload", upload.single("file"), (req, res) => {
      if (
        req.file.contentType === "image/jpeg" ||
        req.file.contentType === "image/png"
      ) {
        res.redirect("/upload-success");
      } else {
        res.redirect("/upload-failure");
      }
      console.log(req.file.contentType);
    });

    router.delete("/pictures/:_id", (req, res) => {
      gfs.remove({ _id: req.params._id, root: "uploads" }, (err, gridStore) => {
        if (err) {
          console.log("Error: ", err);
          return res.status(404).json({ err });
        }
        res.redirect("/pictures");
      });
    });

    app.use(router);
  }
};
