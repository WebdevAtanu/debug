import multer from 'multer';

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

  // Multer errors
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.payloadTooLarge({
          error: 'File size exceeds the allowed limit.',
        });

      case 'LIMIT_UNEXPECTED_FILE':
        return res.unsupportedMedia({
          error: 'Only PNG, JPG, and JPEG files are allowed.',
        });

      default:
        return res.badRequest({
          error: 'File upload failed.',
        });
    }
  }

  next(err);
}