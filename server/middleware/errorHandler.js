export default function errorHandler(err, req, res, next) {
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  // Invalid JSON body
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    'body' in err
  ) {
    return res.badRequest({
      error: 'Invalid JSON format.',
    });
  }

  next(err);
}