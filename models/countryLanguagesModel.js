const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const CountryLanguagesSchema = new mongoose.Schema({
    country_name: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        unique: true
    },
    country_code: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        unique: true
    },
    languages: [{
        language_name: {
            type: String,
            uppercase: true,
            trim: true
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
        }
    }],
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
    }
});

const CountryLanguagesModel = mongoose.model('CountryLanguages', CountryLanguagesSchema);

exports.CountryLanguagesModel = CountryLanguagesModel;