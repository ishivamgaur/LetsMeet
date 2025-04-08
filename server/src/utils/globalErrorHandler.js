const globalErrorHandler = (err, req, res, next) => {
  console.log("\nHits global error handler");
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  res.status(statusCode).json({ message: message });
};

export default globalErrorHandler;
