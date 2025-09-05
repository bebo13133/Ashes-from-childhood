class CustomError extends Error {
  constructor({ message, statusCode, details }) {
    super(message);
    this.statusCode = statusCode || 400;
    this.details = details;
  }
}

module.exports = CustomError;
