const validate = (schema) => {
  return async (req, reply) => {
    try {
      schema.parse(req.body);
    } catch (error) {
      return reply.status(400).send({
        message: "Validation error",
        errors: error.errors.map((e) => e.message),
      });
    }
  };
};

export default validate;
