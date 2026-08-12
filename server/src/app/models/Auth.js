const Joi = require("joi");

const signupSchema = Joi.object({
  username: Joi.string()
    .trim()
    .min(1)
    .max(30)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      "string.empty": "Username is required",
      "string.min": "Username must be at least 3 characters",
      "string.max": "Username must be at most 30 characters",
      "string.pattern.base":
        "Username can only contain letters, numbers and underscores",
    }),

  email: Joi.string().trim().email().max(255).required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email",
  }),

  password: Joi.string().min(6).max(64).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must be at most 64 characters",
  }),
});

const signinSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email",
  }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

module.exports = { signupSchema, signinSchema };
