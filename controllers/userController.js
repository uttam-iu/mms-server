import { isPasswordMatch, getResponseTemplate } from "../helpers/utilities.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MemberModel } from "../schemas/memberSchema.js";

export const login = async (req, res) => {
  const { userName, password } = req?.body;
  if (!userName || !password)
    return getResponseTemplate(
      res,
      400,
      null,
      "userName and password are required.",
    );

  const JWT_SECRET = process.env.JWT_SECRET;

  try {
    const matchedUser = await MemberModel.findOne({
      $or: [{ userName: userName }, { phone: userName }],
    }).lean();

    if (!matchedUser)
      return getResponseTemplate(
        res,
        400,
        null,
        "UserName or Password Mismatch",
      );

    isPasswordMatch(password, matchedUser.password, (isMatch) => {
      if (!isMatch) {
        return getResponseTemplate(
          res,
          400,
          null,
          "UserName or Password Mismatch",
        );
      }

      const { password: _password, ...userWithoutPassword } = matchedUser;
      const token = jwt.sign({ userId: matchedUser?.userId }, JWT_SECRET, {
        expiresIn: "1h",
      });
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
      return getResponseTemplate(
        res,
        200,
        {
          user: userWithoutPassword,
          token,
        },
        "Logged in successfully.",
      );
    });
  } catch (err) {
    console.error("login error", err);
    return getResponseTemplate(res, 500, null, "Server error");
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("login error", err);
    return getResponseTemplate(res, 500, null, "Server error");
  }
};
