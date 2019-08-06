const express   =   require('express');
const router    =   express.Router();
const careReceiverCntrl =   require('../controllers/').careReceiverController;
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
router.get( '/sendLoginCredentialsByCareReceiverId/:care_receiver_id/:operation', careReceiverCntrl.sendLoginCredentialsByCareReceiverId );

router.get( '/isEmailExists/:email', careReceiverCntrl.isEmailExists );

router.get( '/getByEmail/:email', careReceiverCntrl.getCareReceiverByEmail );

router.get( '/getByCareGiverId/:care_giver_id', careReceiverCntrl.getByCareGiverId );

router.get( '/isExists/:care_receiver_id', careReceiverCntrl.isCareReceiverExists );

router.get( '/', careReceiverCntrl.getAllCareReceivers );

router.post( '/', upload.single('profile_image'), careReceiverCntrl.insertCareReceiver );

router.patch( '/:care_receiver_id', upload.single('profile_image'), careReceiverCntrl.updateCareReceiver );

router.get( '/:care_receiver_id', careReceiverCntrl.getCareReceiverById );

router.delete( '/:care_receiver_id', careReceiverCntrl.deleteCareReceiverById );

module.exports = router;