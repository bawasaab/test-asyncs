const path = require('path');
const ObjectId = require('mongodb').ObjectID;
const careReceiverService = require('../services').careReceiverService;
const v = require('node-input-validator');
const { errorHelper } = require('../include/common');

let insertCareReceiver = async ( req, res ) => {
    
    try {

        let result = await careReceiverService.insertCareReceiver( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let updateCareReceiver = async ( req, res ) => {
    
    try {
        
        let result = await careReceiverService.updateCareReceiver( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let getCareReceiverById = async ( req, res ) => {
    
    try {
        
        const result = await careReceiverService.getCareReceiverById( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let getAllCareReceivers = async ( req, res ) => {
    
    try {
        
        const result = await careReceiverService.getAllCareReceivers( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let getCareReceiverByEmail = async ( req, res ) => {
    
    try {
        
        let obj = req.params;
        let required = {
            email:'required|email'
        };
        let validator = new v( obj, required );

        let matched = await validator.check();
        if ( !matched ) {

            let msg = await errorHelper( validator.errors );
            res.send( {
                status: 400,
                message: msg,
                data: null
            });
        } else {

            let email = obj.email;
            const result = await careReceiverService.getCareReceiverByEmail( email );
            res.send( result );
        }
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let getByCareGiverId = async ( req, res ) => {

    try {
        
        const result = await careReceiverService.getByCareGiverId( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let deleteCareReceiverById = async ( req, res ) => {
    
    try {
        
        const result = await careReceiverService.deleteCareReceiverById( req );
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
        
        const result = await careReceiverService.isEmailExists( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let isCareReceiverExists = async ( req, res ) => {

    try {
        
        const result = await careReceiverService.isCareReceiverExists( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let sendLoginCredentialsByCareReceiverId = async ( req, res ) => {

    try {
        console.log('sendLoginCredentialsByCareReceiverId');
        const result = await careReceiverService.sendLoginCredentialsByCareReceiverId( req );
        res.render( 'careReceiverResponse.ejs', { result: result });
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

module.exports = {
    insertCareReceiver: insertCareReceiver,
    updateCareReceiver: updateCareReceiver,
    getCareReceiverById: getCareReceiverById,
    getByCareGiverId: getByCareGiverId,
    getCareReceiverByEmail: getCareReceiverByEmail,
    getAllCareReceivers: getAllCareReceivers,
    deleteCareReceiverById: deleteCareReceiverById,
    isEmailExists: isEmailExists,
    isCareReceiverExists: isCareReceiverExists,
    sendLoginCredentialsByCareReceiverId: sendLoginCredentialsByCareReceiverId
};