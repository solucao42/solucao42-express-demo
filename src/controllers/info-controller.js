const { StatusCodes } = require("http-status-codes");

const info = (req, res) => {
  throw new Error("teste");

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "API is live",
    error: {},
    data: {},
  });
};

module.exports = {
  info,
};
