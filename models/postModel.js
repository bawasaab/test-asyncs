const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const PostSchema = new mongoose.Schema({
    user_id: {
        type: Object,
        required: true,
        trim: true
    },
    description: {
        type: String,
        // required: true,
        lowercase: true,
        trim: true
    },
    privacy_option: {
        type: String,
        enum: ['PUBLIC', 'PRIVATE'],
        default: 'PUBLIC',
        uppercase: true,
        trim: true
    },
    is_anonymous: {
        type: String,
        enum: ['YES', 'NO'],
        default: 'NO',
        trim: true,
        uppercase: true,
        required: true
    },
    post_upload_type: {
        type: String,
        enum: ['AUDIO', 'VIDEO', 'IMAGE','TEXT'],
        default: 'NO',
        trim: true,
        uppercase: true,
        required: true
    },
    post_upload_file: {
        type: String,
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
});

const PostModel = mongoose.model('Community_post', PostSchema);

exports.PostModel = PostModel;