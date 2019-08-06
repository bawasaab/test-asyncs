const ObjectId = require('mongodb').ObjectID;
const documentService = require('../services').documentService;

let uploadDocuments = async ( req, res ) => {
    
    try {

        let result = await documentService.uploadDocuments( req );
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
    uploadDocuments: uploadDocuments,
};