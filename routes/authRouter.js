const express   =   require('express');
const router    =   express.Router();
const authCntrl =   require('../controllers').authController;
const { userProfilePath } = require('../include/constants');

const multer = require('multer');

function getExtension(file) {
  // this function gets the filename extension by determining mimetype. To be exanded to support others, for example .jpeg or .tiff
  var res = '';
  if (file.mimetype === 'image/jpeg') res = '.jpg';
  if (file.mimetype === 'image/png') res = '.png';
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

/* GET users listing. */
router.post( '/login', upload.single('profile_image'), authCntrl.logIn );

router.post( '/refreshToken', upload.single('profile_image'), authCntrl.refreshToken );

router.post( '/logOut', upload.single('profile_image'), authCntrl.logOut );

router.post( '/verifyToken', upload.single('profile_image'), authCntrl.verifyToken );

router.post( '/verifyToken2', upload.single('profile_image'), authCntrl.verifyToken2 );

router.post( '/forgotPassword', upload.single('profile_image'), authCntrl.forgotPassword );

router.get( '/decodeToken', upload.single('profile_image'), authCntrl.decodeToken );

module.exports = router;