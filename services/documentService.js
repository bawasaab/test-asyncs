const fs = require('fs');
var md5 = require('md5');
const jwt = require('jsonwebtoken');
const v = require('node-input-validator');
const ObjectId = require('mongodb').ObjectID;
const { DocumentModel } = require('../models').DocumentModel;
const communityService = require('./communityService');
const { userProfilePath, userGetProfilePath, JWT_SECRET, twillioCredentials } = require('../include/constants');
const { errorHelper } = require('../include/common');

let uploadDocuments = async ( req ) => {
      
    try {

        let obj = req.body;
        let file = req.files;
        
        if(typeof req.files.medical_proof !== 'undefined' || req.files.medical_proof !== null){
           
            req.files.medical_proof.forEach(function(element) {
               medical_proof = element['filename'];
            });
        }
     
        if(typeof req.files.degree_proof !== 'undefined' || req.files.degree_proof !== null){
            req.files.degree_proof.forEach(function(element) {
               degree_proof = element['filename'];
            });
        }
     
        if(typeof req.files.government_proof !== 'undefined' || req.files.government_proof !== null){
            req.files.government_proof.forEach(function(element) {
               government_proof = element['filename'];
            });
        }

        let body = {
            medical_proof: medical_proof,
            degree_proof: degree_proof,
            government_proof: government_proof,
            userid: obj.userid,
            state: obj.state
        };

        let user = new DocumentModel( body );
        let savedUser = await user.save();
        var fullUrl = req.protocol + '://' + req.get('host') + '/' + userGetProfilePath + '/' + savedUser.profile_image;
        savedUser.medical_proof = fullUrl;
        savedUser.password = undefined;
        
        return {
            status: 200,
            message: "Documents upload successfully!",
            data: savedUser
        }
        
    } catch( ex ) {

        return {
            status: 400,
            message: ex.toString(),
            data: null
        };
    }
}


module.exports = {
    uploadDocuments:uploadDocuments,
};