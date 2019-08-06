const ObjectId = require('mongodb').ObjectID;
const userService = require('../services').userService;

let insertUser = async ( req, res ) => {
    
    try {

        let result = await userService.insertUser( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let insertWebUser = async ( req, res ) => {
    
    try {

        let result = await userService.insertWebUser( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let updateUser = async ( req, res ) => {
    
    try {
        
        let result = await userService.updateUser( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let getUserById = async ( req, res ) => {
    
    try {
        
        const result = await userService.getUserById( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let getAllUsers = async ( req, res ) => {
    
    try {
        
        const result = await userService.getAllUsers( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let deleteUserById = async ( req, res ) => {
    
    try {
        
        const result = await userService.deleteUserById( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let isEmailExists = async ( req, res ) => {

    try {
        
        const result = await userService.isEmailExists( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let isSocialIdExists = async ( req, res ) => {

    try {
        
        const result = await userService.isSocialIdExists( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let isUserExists = async ( req, res ) => {

    try {
        
        const result = await userService.isUserExists( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let isPhoneExists = async ( req, res ) => {

    try {
        
        const result = await userService.isPhoneExists( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let changePassword = async ( req, res ) => {
    
    try {

        let result = await userService.changePassword( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let doctoravailability = async ( req, res ) => {
    
    try {

        let result = await userService.doctoravailability( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

module.exports = {
    insertUser: insertUser,
    updateUser: updateUser,
    getUserById: getUserById,
    getAllUsers: getAllUsers,
    deleteUserById: deleteUserById,
    isEmailExists: isEmailExists,
    isSocialIdExists: isSocialIdExists,
    isUserExists: isUserExists,
    isPhoneExists: isPhoneExists,
    insertWebUser:insertWebUser,
    changePassword:changePassword,
    doctoravailability:doctoravailability
};