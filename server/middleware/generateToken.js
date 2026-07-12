import jwt from 'jsonwebtoken';

export default function generateUserToken(req, res) {
  const user = req.user;

  // Create JWT Token
  const token = jwt.sign(
    {
      sub: user.id, // Subject of the token, usually the user ID
      isVerified: user.isVerified,
      provider: user.provider,
      username: user.username,
      name: user.name,
      email: user.email,
      googleId: user.googleId,
    },
    process.env.TOKEN_SECRET, // Secret key used to sign the token
    { expiresIn: '2h' } // Token expiration time (2 hours in this case)
  );

  res.status(200).cookie('jwt', token, { maxAge: 2 * 3600000, httpOnly: true }).send({ token }); // Send the token in the response
};
