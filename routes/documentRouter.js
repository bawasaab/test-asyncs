const express   =   require('express');
const router    =   express.Router();
const documentCntrl =   require('../controllers/documentController');
const { documentPath } = require('../include/constants');

const multer = require('multer');

function getExtension(file) {
    // this function gets the filename extension by determining mimetype. To be exanded to support others, for example .jpeg or .tiff
    var res = '';
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') res = '.docx';
    if (file.mimetype === 'application/pdf') res = '.pdf';
    return res;
}

// MULTER STARTS HERE
// var storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb( null, documentPath )
//   },
//   filename: (req, file, cb) => {
//     cb( null, file.fieldname + '-' + Date.now() + getExtension(file) );
//   }
// });
//var upload = multer({storage: storage});

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, documentPath);
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now()+ getExtension(file));
  }
});
var upload = multer({ storage : storage });

/* GET users listing. */
router.post( '/', upload.fields([{
           name: 'medical_proof', maxCount: 1
         }, {
           name: 'degree_proof', maxCount: 1
         }, {
           name: 'government_proof', maxCount: 1
         }]), documentCntrl.uploadDocuments );
module.exports = router;