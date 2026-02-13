class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;


// why
// instead of return reply.status(404).send({ message: "User not found" });
// we do -> throw new AppError("User not found", 404);
