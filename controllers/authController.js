const authService = require('../services').authService;

let isEmailExists = async ( req, res ) => {

    try {
        
        const result = await authService.isEmailExists( req );
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
        
        const result = await authService.isSocialIdExists( req );
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
        
        const result = await authService.isUserExists( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let logIn = async ( req, res ) => {

    try {
        const result = await authService.logIn( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let refreshToken = async ( req, res ) => {

    try {
        const result = await authService.refreshToken( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let logOut = async ( req, res ) => {

    try {
        
        const result = await authService.logOut( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let verifyToken = async ( req, res, next ) => {

    try {
        
        const result = await authService.verifyToken( req );
        if( result.status != 200 ) {

            res.send( result );
        } else {

            next();
        }
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let verifyToken2 = async ( req, res, next ) => {

    try {
        
        const result = await authService.verifyToken( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let forgotPassword = async ( req, res, next ) => {

    try {
        
        const result = await authService.forgotPassword( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let decodeToken = async ( req, res, next ) => {

    try {
        
        const result = await authService.decodeToken( req );
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
    isEmailExists: isEmailExists,
    isSocialIdExists: isSocialIdExists,
    isUserExists: isUserExists,
    logIn: logIn,
    refreshToken: refreshToken,
    logOut: logOut,
    verifyToken: verifyToken,
    verifyToken2: verifyToken2,
    decodeToken: decodeToken,
    forgotPassword: forgotPassword
};