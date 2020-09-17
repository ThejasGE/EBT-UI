var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

var UserModel = new Schema({

    fullName: {
        type: String,
        trim: true,
    },
    username: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        unique: true
    },
    password: String,
    LastfailedattemptTime: Date,
    isLocked: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    islastLogin: {
        type: Date,
        default: new Date()
    },
    Buildings: {
        type: Array
    }


});

UserModel.pre('save',
    function(next) {
        if (this.password) {
            let p = this.password + 'noc';
            var md5 = crypto.createHash('md5');
            this.password = md5.update(p).digest('hex');
        }

        next();
    }
);



UserModel.methods.comparepasswords = function(password) {
    // console.log(password, this.password);
    var md5 = crypto.createHash('md5');
    // console.log(md5)
    let p = password + 'noc';
    md5 = md5.update(p).digest('hex');
    // console.log(md5)
    return this.password === md5;
};

module.exports = UserModel;
// mongoose.model('User', UserSchema);