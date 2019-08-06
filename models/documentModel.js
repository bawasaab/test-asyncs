const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const DocumentSchema = new mongoose.Schema({
    medical_proof: {
         type: String,
        trim: true
    },
    degree_proof: {
         type: String,
        trim: true
    },
    government_proof: {
         type: String,
        trim: true
    },
    userid: {
         type: String,
        trim: true
    },
});

const DocumentModel = mongoose.model('Document', DocumentSchema);

exports.DocumentModel = DocumentModel;