const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  googleID: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 50,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    required: true,
  },
  thumbnail: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// instance methods
userSchema.methods.isUser = function () {
  return this.role == "user";
};

userSchema.methods.isAdmin = function () {
  return this.role == "admin";
};

userSchema.methods.comparePassword = async function (password, cb) {
  let result;
  try {
    result = await bcrypt.compare(password, this.password);
    return cb(null, result);
  } catch (e) {
    return cb(e, result);
  }
};

// mongoose middlewares
// 若使用者為新用戶，或者是正在更改密碼，則將密碼進行雜湊處理
userSchema.pre("save", async function (next) {
  // this 代表 mongoDB 內的 document
  if (this.isNew || this.isModified("password")) {
    if (this.googleID) {
      // 如果是 Google 登入的使用者，不需要加密密碼
      this.password = undefined;
    } else {
      // 如果是本地註冊的使用者，加密密碼
      const hashValue = await bcrypt.hash(this.password, 10);
      this.password = hashValue;
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
