const express   =   require('express');
const router    =   express.Router();
const userCntrl =   require('../controllers/userController');
const { userProfilePath } = require('../include/constants');

const { verifyToken } = require( '../controllers/authController' );

const multer = require('multer');

function getExtension(file) {
    // this function gets the filename extension by determining mimetype. To be exanded to support others, for example .jpeg or .tiff
    var res = '';
    if (file.mimetype === 'image/jpeg') res = '.jpg';
    if (file.mimetype === 'image/png') res = '.png';
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') res = '.docx';
    if (file.mimetype === 'application/pdf') res = '.pdf';
    return res;
}

// MULTER STARTS HERE
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb( null, userProfilePath )
  },
  filename: (req, file, cb) => {
    cb( null, file.fieldname + '-' + Date.now() + getExtension(file) );
  }
});
var upload = multer({storage: storage});

router.use( verifyToken );

/* GET users listing. */
// router.get( '/isEmailExists/:email', [ verifyToken, userCntrl.isEmailExists ] );
router.get( '/isEmailExists/:email', userCntrl.isEmailExists );

router.get( '/isSocialIdExists/:social_id', userCntrl.isSocialIdExists );

router.get( '/isPhoneExists/:phone', userCntrl.isPhoneExists );

router.get( '/isExists/:userId', userCntrl.isUserExists );

router.get( '/', userCntrl.getAllUsers );

router.post( '/', upload.single('profile_image'), userCntrl.insertUser );

router.patch( '/:userId', upload.fields([{
           name: 'medical_proof', maxCount: 1
         }, {
           name: 'degree_proof', maxCount: 1
         }, {
           name: 'government_proof', maxCount: 1
         }, {
           name: 'profile_image', maxCount: 1
         }]), userCntrl.updateUser );

router.get( '/:userId', userCntrl.getUserById );

router.delete( '/:userId', userCntrl.deleteUserById );

// router.post( '/addwebuser', upload.single('profile_image'), userCntrl.insertWebUser );
router.post( '/addwebuser', upload.array('documents'), userCntrl.insertWebUser );

router.post( '/changepassword', upload.single('profile_image'), userCntrl.changePassword );

router.post( '/doctoravailability', upload.single('profile_image'),  userCntrl.doctoravailability );

module.exports = router;