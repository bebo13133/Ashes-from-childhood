const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

function tokenGenerator(type, data) {
  const payload = {
    userId: data.id.toString(),
    email: data.email,
    role: data.role,
    enabled: data.finished,
  };

  let refreshTokenId;

  if (type === 'refresh') {
    refreshTokenId = uuid.v4();
    payload.refreshTokenId = refreshTokenId;
  }

  const token = jwt.sign(payload, type === 'access' ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET, {
    expiresIn: type === 'access' ? '15m' : '7d',
  });

  const expiryDate = new Date();
  expiryDate.setSeconds(expiryDate.getSeconds() + jwt.decode(token).exp - Math.floor(Date.now() / 1000));

  return { token, refreshTokenId, expiryDate };
}

function tokenVerification(type, token) {
  return type === 'access' ? jwt.verify(token, ACCESS_TOKEN_SECRET) : jwt.verify(token, REFRESH_TOKEN_SECRET);
}

module.exports = { tokenVerification, tokenGenerator };
