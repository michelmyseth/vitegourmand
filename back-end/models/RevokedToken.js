// Tokens invalidated by a logout (KAN-36). MongoDB deletes each document
// automatically once the token has expired anyway (TTL index).
const { mongoose } = require('../config/mongo');

const revokedTokenSchema = new mongoose.Schema(
  {
    jti: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { collection: 'revoked_tokens', versionKey: false },
);

module.exports = mongoose.model('RevokedToken', revokedTokenSchema);
