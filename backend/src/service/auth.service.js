import prisma from "../../prisma/client.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

const toPublicUser = (user) => {
  const { password: _p, ...rest } = user;
  return rest;
};

// REGISTER
export const registerUser = async (data) => {
  const { name, email, password } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const token = generateToken(user);

  return { user: toPublicUser(user), token };
};

// LOGIN
export const loginUser = async (data) => {
  const { email, password } = data;

    if (!password) {
        throw new Error("Password is required");
    }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValid = await comparePassword(password, user.password);
    
    if (!isValid) {
        throw new Error("Invalid credentials");
    }

  const token = generateToken(user);

  return { user: toPublicUser(user), token };
};