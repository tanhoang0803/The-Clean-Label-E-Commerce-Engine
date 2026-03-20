const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const SALT_ROUNDS = 12;
const JWT_EXPIRY = '7d';

/**
 * Registers a new user.
 *
 * @param {string} email
 * @param {string} password - Plain-text password (will be hashed)
 * @returns {Promise<{ user: object, token: string }>}
 */
async function register(email, password) {
  if (!email || !password) {
    const err = new Error('Email and password are required');
    err.status = 400;
    throw err;
  }

  if (password.length < 8) {
    const err = new Error('Password must be at least 8 characters');
    err.status = 400;
    throw err;
  }

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const err = new Error('An account with that email already exists');
    err.status = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.create({ email, password_hash });

  const token = signToken(user);
  return { user: sanitizeUser(user), token };
}

/**
 * Authenticates a user and returns a JWT.
 *
 * @param {string} email
 * @param {string} password - Plain-text password
 * @returns {Promise<{ user: object, token: string }>}
 */
async function login(email, password) {
  if (!email || !password) {
    const err = new Error('Email and password are required');
    err.status = 400;
    throw err;
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const token = signToken(user);
  return { user: sanitizeUser(user), token };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

function sanitizeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

module.exports = { register, login };
