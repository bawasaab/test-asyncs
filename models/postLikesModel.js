const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const PostLikesSchema = new mongoose.Schema({
    user_id: {
        type: Object,
        required: true,
        trim: true
    },
    post_id: {
        type: Object,
        required: true,
        trim: true
    },
    like_type: {
        type: String,
        enum: ['HAHA', 'WOW', 'LIKE', 'HEART', 'SAD', 'ANGRY', 'UNLIKE'],
        default: 'LIKE',
        uppercase: true,
        required: true,
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

const PostLikesModel = mongoose.model('Community_post_likes', PostLikesSchema);

exports.PostLikesModel = PostLikesModel;