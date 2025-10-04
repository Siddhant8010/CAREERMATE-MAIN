const User = require("../models/usermodel");
const { createSecretToken } = require("../util/secrettoken");
const bcrypt = require("bcryptjs");

exports.Signup = async (req, res, next) => {
  try {
    const { email, password, username, createdAt } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    
    const user = await User.create({ email, password, username, createdAt });
    req.session.user = user;
    const token = createSecretToken(user._id);

    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    
    res.status(201).json({ message: "User signed in successfully", success: true, user });
    
  } catch (error) {
    console.error(error);
  }
};

module.exports.Login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.json({ message: 'All fields are required' });
    }
    const user = await User.findOne({ username }); // <-- changed from email
    if (!user) {
      return res.json({ message: 'Incorrect username or password' });
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.json({ message: 'Incorrect username or password' });
    }
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    req.session.user = user; 
    res.status(201).json({ message: "User logged in successfully", success: true });
    
  } catch (error) {
    console.error(error);
  }
};
