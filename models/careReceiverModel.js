const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const CareReceiverSchema = new mongoose.Schema({
    care_giver_id: {
        type: Object,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    is_care_receiver_minor: {
        type: String,
        enum: ['YES', 'NO'],
        trim: true,
        uppercase: true,
        default: 'YES' 
    },
    relationship: {
        type: String,
        enum: ['FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'FRIEND'],
        trim: true,
        uppercase: true,
        default: 'MOTHER' 
    },
    created_at: {
        type: Date,
        default: new Date()
    },
    updated_at: {
        type: Date,
        default: new Date()
    },
    status: {
        type: String,
        enum: ['OPEN', 'CLOSE', 'DELETED'],
        trim: true,
        uppercase: true,
        default: 'OPEN'        
    },
    profile_image: {
        type: String,
        trim: true
    },
});

const CareReceiverModel = mongoose.model('Care_receiver', CareReceiverSchema);

exports.CareReceiverModel = CareReceiverModel;