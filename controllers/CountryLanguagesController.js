const ObjectId = require('mongodb').ObjectID;
const countryLanguagesService = require('../services').countryLanguagesService;

let insertCountry = async ( req, res ) => {
    
    try {

        let result = await countryLanguagesService.insertCountry( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let updateCountry = async ( req, res ) => {
    
    try {
        
        let result = await countryLanguagesService.updateCountry( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let getCountryById = async ( req, res ) => {
    
    try {
        
        const result = await countryLanguagesService.getCountryById( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let getAllCountries = async ( req, res ) => {
    
    try {
        
        const result = await countryLanguagesService.getAllCountries( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let deleteCountryById = async ( req, res ) => {
    
    try {
        
        const result = await countryLanguagesService.deleteCountryById( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let isCountryExists = async ( req, res ) => {

    try {
        
        const result = await countryLanguagesService.isCountryExists( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let isCountryNameExists = async ( req, res ) => {

    try {
        
        const result = await countryLanguagesService.isCountryNameExists( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let getCountryByCountryCode = async ( req, res ) => {
    
    try {
        
        const result = await countryLanguagesService.getCountryByCountryCode( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let insertLanguage = async ( req, res ) => {
    
    try {

        let result = await countryLanguagesService.insertLanguage( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let updateLanguage = async ( req, res ) => {
    
    try {
        
        let result = await countryLanguagesService.updateLanguage( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let getLanguageById = async ( req, res ) => {
    
    try {
        
        const result = await countryLanguagesService.getLanguageById( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let getAllLanguagesByCountryId = async ( req, res ) => {
    
    try {
        
        const result = await countryLanguagesService.getAllLanguagesByCountryId( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let deleteLanguageById = async ( req, res ) => {
    
    try {
        
        const result = await countryLanguagesService.deleteLanguageById( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let isLanguageExists = async ( req, res ) => {

    try {
        
        const result = await countryLanguagesService.isLanguageExists( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let isLanguageNameExists = async ( req, res ) => {

    try {
        
        const result = await countryLanguagesService.isLanguageNameExists( req );
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
    insertCountry: insertCountry,
    updateCountry: updateCountry,
    getCountryById: getCountryById,
    getAllCountries: getAllCountries,
    deleteCountryById: deleteCountryById,
    isCountryExists: isCountryExists,
    isCountryNameExists: isCountryNameExists,
    getCountryByCountryCode: getCountryByCountryCode,

    insertLanguage: insertLanguage,
    updateLanguage: updateLanguage,
    getLanguageById: getLanguageById,
    getAllLanguagesByCountryId: getAllLanguagesByCountryId,
    deleteLanguageById: deleteLanguageById,
    isLanguageExists: isLanguageExists,
    isLanguageNameExists: isLanguageNameExists
};