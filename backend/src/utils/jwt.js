import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email }, // Payload
    process.env.SECRET_KEY,             // The value from your .env
    { expiresIn: '1d' }                // Token expiry
  );
};