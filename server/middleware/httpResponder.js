import { CONSTANTS } from "../constants.js";

const httpResponder = function (req, res, next) {
  res.forbidden = data => res.status(CONSTANTS.FORBIDDEN).json(data);
  res.notFound = data => res.status(CONSTANTS.NOT_FOUND).json(data);
  res.ok = data => res.status(CONSTANTS.OK).json(data);
  res.unprocessable = data => res.status(CONSTANTS.UNPROCESSABLE).json(data);
  res.conflict = data => res.status(CONSTANTS.CONFLICT).json(data);
  res.notAuthorized = data => res.status(CONSTANTS.NOT_AUTHORIZED).json(data);
  res.badRequest = data => res.status(CONSTANTS.BAD_REQUEST).json(data);

  res.deleted = data => res.status(CONSTANTS.DELETED).json(data);
  res.created = data => res.status(CONSTANTS.CREATED).json(data);
  res.internalError = data => res.status(CONSTANTS.INTERNAL_ERROR).json(data);
  res.notImplemented = data => res.status(CONSTANTS.NOT_IMPLEMENTED).json(data);
  res.unsupportedMedia = data => res.status(CONSTANTS.UNSUPPORTED_MEDIA).json(data);
  res.payloadTooLarge = data => res.status(CONSTANTS.PAYLOAD_TOO_LARGE).json(data);

  next();
};

export default httpResponder;
