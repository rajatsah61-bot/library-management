// Catch-all for requests that don't match any routes
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); // Pass the error to the global errorHandler
};

// Global error handler
const errorHandler = (err, req, res, next) => {
    // Sometimes a status code is 200 even if an error is thrown, so we default to 500 (Server Error)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode);
    res.json({
        message: err.message,
        // Only show the detailed stack trace if you are in development mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };