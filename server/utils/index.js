// Utility function to extract username from email
export const extractUsernameFromEmail = emailStr => {
  return emailStr.replace(/\./g, '').match(/([^@]+)/)[1];
};

// Utility function to extract JWT token from cookies
export const cookieExtractor = function (req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['jwt'];
  }
  return token;
};
