import mongoose from "mongoose";
import AppError from "../utils/AppError.js";

const validateObjectId = (paramName) => {
  return (req, reply, done) => {
    const id = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid ID format", 400);
    }

    done();
  };
};

export default validateObjectId;
