export const extractUsernameFromEmail = emailStr => {
  return emailStr.replace(/\./g, '').match(/([^@]+)/)[1];
};

export const cookieExtractor = function (req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['jwt'];
  }
  return token;
};
