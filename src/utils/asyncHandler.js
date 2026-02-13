const asyncHandler = (fn) => {
  return async (req, reply) => {
    try {
      await fn(req, reply);
    } catch (error) {
      reply.send(error);
    }
  };
};

export default asyncHandler;
