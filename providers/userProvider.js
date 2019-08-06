const { UserModel } = require('../models').userModel;
const { userProfilePath, userGetProfilePath, JWT_SECRET } = require('../include/constants');

let insertUser = async ( body ) => {
console.log('inside provider');
    try {

        let user = new UserModel( body );
        let savedUser = await user.save();
        var fullUrl = req.protocol + '://' + req.get('host') + '/' + userGetProfilePath + '/' + savedUser.profile_image;
        savedUser.profile_image = fullUrl;
        savedUser.password = undefined;

        return savedUser;
    } catch( ex ) {

        return ex;
    }
}

module.exports = {
    insertUser: insertUser
};