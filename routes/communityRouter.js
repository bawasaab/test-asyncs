const express   =   require('express');
const router    =   express.Router();
const app = express();
const communityCntrl =   require('../controllers/communityController');
const { postProfilePath } = require('../include/constants');
const { verifyToken } = require('../controllers/').authController;

const multer = require('multer');

function getExtension(file) {
    // this function gets the filename extension by determining mimetype. To be exanded to support others, for example .jpeg or .tiff
    var res = '';
    // image formats
    if (file.mimetype === 'image/jpeg') res = '.jpg';
    if (file.mimetype === 'image/png') res = '.png';

    // audio formats
    if (file.mimetype === 'audio/mpeg') res = '.mp3';
    if (file.mimetype === 'audio/wave') res = '.wav';
    if (file.mimetype === 'audio/ogg') res = '.ogg';
    if (file.mimetype === 'audio/x-aac') res = '.aac';

    // video formats
    if (file.mimetype === 'video/mp4') res = '.mp4';
    if (file.mimetype === 'video/x-flv') res = '.flv';
    if (file.mimetype === 'video/x-matroska') res = '.mkv';
    if (file.mimetype === 'video/3gpp') res = '.3gp';
    
    return res;
}

// MULTER STARTS HERE
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb( null, postProfilePath )
  },
  filename: (req, file, cb) => {
    cb( null, file.fieldname + '-' + Date.now() + getExtension(file) );
  }
});
var upload = multer({storage: storage});

/* GET users listing. */

// router.post( '/posts/:post_id/users/:user_id/likes', communityCntrl.insertUserPostLikes );
router.get( '/posts/likedByUserId', communityCntrl.getPostsLikedByUserId );

router.post( '/posts/likes', upload.single('post_upload_file'), communityCntrl.insertUserPostLikes );

router.get( '/posts/isExists/:post_id', communityCntrl.isPostExists );

router.post( '/posts/modifyAllPostAnonymousStatus/:user_id', communityCntrl.modifyPostAnonymousStatus )

router.get( '/posts', communityCntrl.getAllPosts );

router.post( '/posts', upload.single('post_upload_file'), communityCntrl.insertPost );

router.patch( '/posts/:post_id', upload.single('post_upload_file'), communityCntrl.updatePost );

router.get( '/posts/:post_id', communityCntrl.getPostById );

router.delete( '/posts/:post_id', communityCntrl.deletePostById );

module.exports = router;