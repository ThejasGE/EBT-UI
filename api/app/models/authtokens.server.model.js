const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const TokenSchema = new Schema({
    domain: String,
    token: String,
    username: String
});
var Authtokens = mongoose.model('authtokens', TokenSchema);
module.exports = TokenSchema;