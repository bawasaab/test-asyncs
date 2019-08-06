const express               =   require('express');
const router                =   express.Router();
const countryLanguagesCntrl =   require('../controllers/').CountryLanguagesController;
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
router.get( '/isLanguageExists/:languageId', countryLanguagesCntrl.isLanguageExists );

router.get( '/isLanguageNameExists/:country_name', countryLanguagesCntrl.isLanguageNameExists );

router.get( '/:country_id', countryLanguagesCntrl.getAllLanguagesByCountryId );

router.post( '/', upload.single('profile_image'), countryLanguagesCntrl.insertLanguage );

router.patch( '/:languageId', upload.single('profile_image'), countryLanguagesCntrl.updateLanguage );

router.get( '/:languageId', countryLanguagesCntrl.getLanguageById );

router.delete( '/:languageId', countryLanguagesCntrl.deleteLanguageById );

module.exports = router;