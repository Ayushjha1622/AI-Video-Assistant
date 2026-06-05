import bcrypt from "bcryptjs";

import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";

export const register = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    const exists =
      await User.findOne({ email });

    if (exists)
      return res.status(400).json({
        message:
          "User already exists",
      });

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user =
      await User.create({
        name,
        email,
        password: hashedPassword,
      });

    return res.json({
      token: generateToken(user._id),
      user,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const login = async (
  req,
  res
) => {
  try {
    const { email, password } =
      req.body;

    const user =
      await User.findOne({ email });

    if (!user)
      return res.status(400).json({
        message:
          "Invalid credentials",
      });

    const valid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!valid)
      return res.status(400).json({
        message:
          "Invalid credentials",
      });

    res.json({
      token: generateToken(user._id),
      user,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};