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

router.post( '/:country_id/languages', upload.single('profile_image'), countryLanguagesCntrl.insertLanguage );

router.patch( '/:country_id/languages/:language_id', upload.single('profile_image'), countryLanguagesCntrl.updateLanguage );

router.get( '/:country_id/languages/:language_id', upload.single('profile_image'), countryLanguagesCntrl.getLanguageById );

router.get( '/:country_id/isLanguageExists/:language_id', upload.single('profile_image'), countryLanguagesCntrl.isLanguageExists );

router.get( '/:country_id/isLanguageNameExists/:language_name', upload.single('profile_image'), countryLanguagesCntrl.isLanguageNameExists );


router.get( '/isCountryExists/:countryId', countryLanguagesCntrl.isCountryExists );

router.get( '/isCountryNameExists/:country_name', countryLanguagesCntrl.isCountryNameExists );

router.get( '/getByCountryCode/:country_code', countryLanguagesCntrl.getCountryByCountryCode );

router.get( '/', countryLanguagesCntrl.getAllCountries );

router.post( '/', upload.single('profile_image'), countryLanguagesCntrl.insertCountry );

router.patch( '/:countryId', upload.single('profile_image'), countryLanguagesCntrl.updateCountry );

router.get( '/:countryId', countryLanguagesCntrl.getCountryById );

router.delete( '/:countryId', countryLanguagesCntrl.deleteCountryById );

module.exports = router;