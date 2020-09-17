const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const SceneSchema = new Schema({
    floorId: {
        type: Schema.ObjectId,
        ref: 'Floors',
        index: true
    },
    hostId: {
        type: Schema.ObjectId,
        ref: 'Hosts'
    },
    zoneId: {
        type: Schema.ObjectId,
        ref: 'Zones'
    },
    name: {
        type: String,
        index: true
    },
})
SceneSchema.pre('save', function(next) {
    next();
});
SceneSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
var Scenes = mongoose.model('Scenes', SceneSchema);
module.exports = SceneSchema;