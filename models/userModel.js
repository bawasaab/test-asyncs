const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const UserSchema = new mongoose.Schema({
    
    care_giver_id: {
        type: Object,
        trim: true,
        default: -1
    },
    is_care_receiver_minor: {
        type: String,
        enum: ['YES', 'NO'],
        trim: true,
        uppercase: true,
        default: 'NO' 
    },
    relationship: {
        type: String,
        enum: ['FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'FRIEND'],
        trim: true,
        uppercase: true,
        default: 'MOTHER' 
    },
    id_logged_in_already: {
        type: String,
        enum: ['YES', 'NO'],
        trim: true,
        uppercase: true,
        default: 'NO' 
    },

    first_name: {
        type: String,
        required: true,
        // lowercase: true,
        trim: true
    },
    last_name: {
        type: String,
        // lowercase: true,
        trim: true
    },
    nick_name: {
        type: String,
        // lowercase: true,
        trim: true
    },
    email: {
        type: String,
        // required: true,
        // unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        // required: true,
        enum: ['PROFESSIONAL', 'CLIENT'],
        uppercase: true,
        trim: true
    },
    speciality: {
        type: String,
        // enum: ['SURGEON', 'TEST', 'MBBS', 'MD', 'BDS', 'OTHER'],
        uppercase: true,
        trim: true,
        // default: 'SURGEON'
    },
    work_experience: {
        type: String,
        // lowercase: true,
        trim: true
    },
    language_preferences: {
        type: Array,
        // required: true,
        uppercase: true,
        trim: true
    },
    profile_image: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        enum: ['MALE', 'FEMALE'],
        uppercase: true,
        trim: true,
        default: 'MALE'
    },
    login_type: {
        type: String,
        enum: ['FACEBOOK', 'GOOGLE', 'NATIVE'],
        trim: true,
        uppercase: true,
        default: 'NATIVE'
    },
    social_id: {
        type: String,
        trim: true
    },
    referral_code: {
        type: String,
        trim: true
    },
    dob: {
        type: Date,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true,
        uppercase: true,
        // required: true
    },
    is_anonymous: {
        type: String,
        enum: ['YES', 'NO'],
        default: 'NO',
        trim: true,
        uppercase: true
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
    profession: {
        type: String,
        trim: true
    },
    available_days: {
        type: Array,
        trim: true
    },
    available_time: {
        type: String,
        trim: true
    },
    time_slot: {
        type: Array,
        trim: true
    },
    state: {
        type: String,
        trim: true
    }
});

const UserModel = mongoose.model('User', UserSchema);

exports.UserModel = UserModel;