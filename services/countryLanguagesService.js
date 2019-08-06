const v = require('node-input-validator');
const ObjectId = require('mongodb').ObjectID;
const { CountryLanguagesModel } = require('../models').countryModel;
const { errorHelper } = require('../include/common');

let insertCountry = async ( req ) => {
    
    try {

        let obj = req.body;
        let file = req.file;

        /** VALIDATIONS CONFIG STARTS HERE */
        let required = {
            country_name: 'required|minLength:3',
            country_code: 'required|minLength:3'
        };

        let validator = new v( obj, required );
        /** VALIDATIONS CONFIG ENDS HERE */

        let matched = await validator.check();
        if ( !matched ) {
            
            let msg = await errorHelper( validator.errors );
            return {
                status: 400,
                message: msg,
                data: null
            };
        } else {

            let body = {
                'country_name': obj.country_name,
                'country_code': obj.country_code
            };
            
            let country = new CountryLanguagesModel( body );
            let savedCountry = await country.save();
            
            return {
                status: 200,
                message: "country added successfully!",
                data: savedCountry
            }
        }
    } catch( ex ) {

        return {
            status: 400,
            message: ex.toString(),
            data: null
        };
    }
}

let updateCountry = async ( req ) => {
    
    try {
        
        let countryId = ObjectId( req.params.countryId );
        const country = await CountryLanguagesModel.findById( countryId );
        if( country ) {

            let body = {};
            let obj = req.body;
            let file = req.file;

            'country_name'                  in obj ? body.country_name = obj.country_name : body.country_name = country.country_name;
            'country_code'                  in obj ? body.country_code = obj.country_code : body.country_code = country.country_code;
            
            if( req.file != undefined && req.file.fieldname == 'profile_image' ) {

                let filePath = countryProfilePath + '/' + country.profile_image;
                fs.unlink( filePath, (err) => {
                    console.log( `${filePath} was deleted` );
                });
                body.profile_image = file.filename;
            } 

            let updatedcountry = await CountryLanguagesModel.updateOne( { _id: countryId }, body);
            if( updatedcountry ) {

                const country = await CountryLanguagesModel.findById( countryId );
                if( !country ) {

                    return {
                        status: 400,
                        message: "unable to get country!",
                        data: country
                    };
                } else {
                    
                    return {
                        status: 200,
                        message: "country has been updated successfully!",
                        data: country,
                        updatedRecordsCount: updatedcountry.n
                    };
                }
            } else {

                return {
                    status: 400,
                    message: "unable to update country!",
                    data: null
                };
            }
        } else {

            return {
                status: 204,
                message: "country does not exist",
                data: null
            };
        }
    } catch( ex ) {

        return {
            status: 400,
            message: ex.toString(),
            data: null
        };
    }
}

let getCountryById = async ( req ) => {
    
    try {
        
        let countryId = ObjectId( req.params.countryId );
        const country = await CountryLanguagesModel.findById( countryId );
        if( !country ) {

            return {
                status: 204,
                message: "country not found!",
                data: null,
                err: country
            };
        } else {
            
            return {
                status: 200,
                message: "country found successfully!",
                data: country
            };
        }
    } catch( ex ) {

        return {
            status: 400,
            message: ex.toString(),
            data: null
        };
    }
}

let getAllCountries = async ( req ) => {
    
    try {

        // Specify in the sort parameter the field or fields to sort by and a value of 1 or -1 to specify an ascending or descending sort respectively.
        const country = await CountryLanguagesModel.find().sort([['created_at', '-1']]);
        if( !country ) {

            return {
                status: 204,
                message: "countries not found!",
                data: null,
                err: country
            };
        } else {
            
            return {
                status: 200,
                message: "countries found successfully!",
                data: country
            };
        }
    } catch( ex ) {

        return {
            status: 400,
            message: ex.toString(),
            data: null
        };
    }
}

let deleteCountryById = async ( req ) => {
    
    try {

        let countryId = ObjectId( req.params.countryId );
        const country = await CountryLanguagesModel.findById( countryId );
        if( country ) {
            
            let deletecountry = await CountryLanguagesModel.deleteOne( { _id: countryId} );
            return {
                status: 200,
                message: "country deleted successfully!",
                data: deletecountry
            };
        } else {

            return {
                status: 204,
                message: "country does not exist",
                data: null
            };
        }
    } catch( ex ) {

        return {
            status: 400,
            message: ex.toString(),
            data: null
        };
    }
}

let isCountryExists = async ( req ) => {

    try {

        let countryId = ObjectId( req.params.countryId );
        const country = await CountryLanguagesModel.count( {_id: countryId} );
        if( country ) {

            return {
                status: 200,
                message: "country id exists!",
                data: {
                    exists: country
                }
            };
        } else {

            return {
                status: 204,
                message: "country id does not exist",
                data: {
                    exists: country
                }
            };
        }
    } catch( ex ) {

        return {
            status: 400,
            message: ex.toString(),
            data: null
        };
    }
}

let isCountryNameExists = async ( req ) => {

    try {

        let obj = req.params;

        /** VALIDATIONS CONFIG STARTS HERE */
        let required = {
            country_name: 'required|minLength:3'
        };

        let validator = new v( obj, required );
        /** VALIDATIONS CONFIG ENDS HERE */

        let matched = await validator.check();
        if ( !matched ) {
          
            return {
                status: 400,
                message: msg,
                data: null
            };
        } else {

            let country_name = req.params.country_name;
            const country = await CountryLanguagesModel.count( {country_name: country_name} );
            if( country ) {

                return {
                    status: 200,
                    message: "country name exists!",
                    data: {
                        exists: country
                    }
                };
            } else {

                return {
                    status: 204,
                    message: "country name does not exist",
                    data: {
                        exists: country
                    }
                };
            }
        }
    } catch( ex ) {

        return {
            status: 400,
            message: ex.toString(),
            data: null
        };
    }
}

let getCountryByCountryCode = async ( req ) => {
    
    try {
        
        let country_code = req.params.country_code;
        const country = await CountryLanguagesModel.find( {country_code: country_code} );
        if( !country ) {

            return {
                status: 204,
                message: "country not found!",
                data: null,
                err: country
            };
        } else {
            
            return {
                status: 200,
                message: "country found successfully!",
                data: country
            };
        }
    } catch( ex ) {

        return {
            status: 400,
            message: ex.toString(),
            data: null
        };
    }
}

// COUNTRY ENDS HERE

// LANGUAGE STARTS HERE
let insertLanguage = async ( req ) => {
    
    try {

        let obj = req.body;
        let file = req.file;
        let country_id = req.params.country_id;
        obj.country_id = country_id;

        /** VALIDATIONS CONFIG STARTS HERE */
        let required = {
            language_name: 'required|minLength:3',
            country_id: 'required'
        };

        let validator = new v( obj, required );
        /** VALIDATIONS CONFIG ENDS HERE */

        let matched = await validator.check();
        if ( !matched ) {

            let msg = await errorHelper( validator.errors );
            return {
                status: 400,
                message: msg,
                data: null
            };
        } else {

            let countryId = ObjectId( req.body.country_id );
            let country = await CountryLanguagesModel.findById( countryId );
            if( !country ) {

                return {
                    status: 204,
                    message: "country not found!",
                    data: null
                };
            } else {
                
                country.languages.push({
                    language_name : req.body.language_name
                });

                let updatedcountry = await CountryLanguagesModel.updateOne( { _id: countryId }, country);
                if( updatedcountry ) {

                    const country = await CountryLanguagesModel.findById( countryId );
                    if( !country ) {

                        return {
                            status: 400,
                            message: "unable to get languages!",
                            data: null
                        };
                    } else {
                        
                        return {
                            status: 200,
                            message: "language has been updated successfully!",
                            data: country,
                            updatedRecordsCount: updatedcountry.n
                        };
                    }
                } else {

                    return {
                        status: 400,
                        message: "unable to update language!",
                        data: null
                    };
                }
            }
        }
    } catch( ex ) {

        return {
            status: 400,
            message: ex.toString(),
            data: null
        };
    }
}

let updateLanguage = async ( req ) => {
    
    try {
        
        let country_id = ObjectId( req.params.country_id );
        let language_id = ObjectId( req.params.language_id );
        const Language = await CountryLanguagesModel.find({ 
            _id: country_id,
        }).select({
            "_id": 1,
            "country_name": 1,
            "languages": 1
        });
        if( Language ) {

            let body = {};
            let obj = req.body;
            let file = req.file;
            obj.country_id = country_id;
            obj.language_id = language_id;

            if( req.file != undefined && req.file.fieldname == 'profile_image' ) {

                let filePath = countryProfilePath + '/' + country.profile_image;
                fs.unlink( filePath, (err) => {
                    console.log( `${filePath} was deleted` );
                });
                body.profile_image = file.filename;
            }

            let updatedLanguage = await CountryLanguagesModel.findOne( { _id: country_id }, function( err, countryModel){

                let languages = countryModel.languages;
                pos = languages.map(function(e) { return e._id; }).indexOf( language_id );
                
                if( pos > -1 ) {

                    if( languages[pos] && languages[pos].language_name ) {
                        
                        languages[pos].language_name = obj.language_name;
                    } else {
                        languages[pos].push({
                            language_name: obj.language_name
                        });
                    }
                    countryModel.save();
                } 
            });

            if( updatedLanguage ) {

                const Language = await CountryLanguagesModel.findById( country_id );
                if( !Language ) {

                    return {
                        status: 400,
                        message: "unable to get country!",
                        data: null
                    };
                } else {
                    
                    return {
                        status: 200,
                        message: "Language has been updated successfully!",
                        data: Language,
                        updatedRecordsCount: updatedLanguage.n
                    };
                }
            } else {

                return {
                    status: 400,
                    message: "unable to update country!",
                    data: null
                };
            }
        } else {

            return {
                status: 204,
                message: "Language does not exist",
                data: null
            };
        }
    } catch( ex ) {

        return {
            status: 400,
            message: ex.toString(),
            data: null
        };
    }
}

let getLanguageById = async ( req ) => {
    
    try {
        
        let country_id = ObjectId( req.params.country_id );
        let language_id = ObjectId( req.params.language_id );

        // console.log('country_id', country_id);
        // console.log('language_id', language_id);
        
        const Language = await CountryLanguagesModel.findOne( {
            _id: country_id,
            // "languages._id": language_id
            // languages: { _id: language_id }
        } );

        // const Language = await CountryLanguagesModel.findOne({_id: country_id});
        if( !Language ) {

            return {
                status: 204,
                message: "Language not found!",
                data: null,
                err: Language
            };
        } else {
            
            let languages = Language.languages;
            pos = languages.map(function(e) { return e._id; }).indexOf( language_id );
            
            if( pos > -1 ) {

                if( languages[pos] ) {
                    
                    // languages[pos].language_name = obj.language_name;
                    return {
                        status: 200,
                        message: "Language found successfully!",
                        data: languages[pos]
                    };
                } else {
                    return {
                        status: 204,
                        message: "Language not found!",
                        data: null,
                        err: Language
                    };
                }
            } 
        }
    } catch( ex ) {

        return {
            status: 400,
            message: ex.toString(),
            data: null
        };
    }
}

let getAllLanguagesByCountryId = async ( req ) => {
    
    try {

        let country_id = req.params.country_id;
        // Specify in the sort parameter the field or fields to sort by and a value of 1 or -1 to specify an ascending or descending sort respectively.
        const Language = await CountryLanguagesModel.find({
            _id: country_id
        });
        if( !Language ) {

            return {
                status: 204,
                message: "languages not found!",
                data: null,
                err: Language
            };
        } else {
            
            return {
                status: 200,
                message: "languages found successfully!",
                data: Language
            };
        }
    } catch( ex ) {

        return {
            status: 400,
            message: ex.toString(),
            data: null
        };
    }
}

let deleteLanguageById = async ( req ) => {
    
    try {

        let languageId = ObjectId( req.params.languageId );
        const Language = await CountryLanguagesModel.findById( languageId );
        if( Language ) {
            
            let deleteLanguage = await CountryLanguagesModel.deleteOne( { _id: languageId} );
            return {
                status: 200,
                message: "Language deleted successfully!",
                data: deletecountry
            };
        } else {

            return {
                status: 204,
                message: "Language does not exist",
                data: null
            };
        }
    } catch( ex ) {

        return {
            status: 400,
            message: ex.toString(),
            data: null
        };
    }
}

let isLanguageExists = async ( req ) => {

    try {

        let country_id = ObjectId( req.params.country_id );
        let language_id = ObjectId( req.params.language_id );
        const Language = await CountryLanguagesModel.findOne( {
            _id: country_id
        } );
        if( Language ) {

            let languages = Language.languages;
            pos = languages.map(function(e) { return e._id; }).indexOf( language_id );
            
            if( pos > -1 ) {

                if( languages[pos] ) {

                    return {
                        status: 200,
                        message: "Language id exists!",
                        data: {
                            exists: 1
                        }
                    };
                } else {

                    return {
                        status: 204,
                        message: "Language id not exists!",
                        data: {
                            exists: 0
                        }
                    };
                }
            } else {
                return {
                    status: 204,
                    message: "Language id not exists!",
                    data: {
                        exists: 0
                    }
                };
            }
            
        } else {
            
            return {
                status: 204,
                message: "Language id does not exist",
                data: {
                    exists: country
                }
            };
        }
    } catch( ex ) {

        return {
            status: 400,
            message: ex.toString(),
            data: null
        };
    }
}

let isLanguageNameExists = async ( req ) => {

    try {

        let country_id = ObjectId( req.params.country_id );
        let language_name = req.params.language_name.toUpperCase();
        const Language = await CountryLanguagesModel.findOne( {
            _id: country_id
        } );

        if( Language ) {

            let languages = Language.languages;
            pos = languages.map(function(e) { return e.language_name; }).indexOf( language_name );
            if( pos > -1 ) {

                if( languages[pos] ) {

                    return {
                        status: 200,
                        message: "Language name exists!",
                        data: {
                            exists: 1
                        }
                    };
                } else {

                    return {
                        status: 204,
                        message: "Language name not exists!",
                        data: {
                            exists: 0
                        }
                    };
                }
            } else {

                return {
                    status: 204,
                    message: "Language name not exists!",
                    data: {
                        exists: 0
                    }
                };
            }            
        } else {
            
            return {
                status: 204,
                message: "Language id does not exist",
                data: {
                    exists: country
                }
            };
        }        
    } catch( ex ) {

        return {
            status: 400,
            message: ex.toString(),
            data: null
        };
    }
}

module.exports = {
    insertCountry: insertCountry,
    updateCountry: updateCountry,
    getCountryById: getCountryById,
    getAllCountries: getAllCountries,
    deleteCountryById: deleteCountryById,
    isCountryExists: isCountryExists,
    isCountryNameExists: isCountryNameExists,
    getCountryByCountryCode: getCountryByCountryCode,

    insertLanguage: insertLanguage,
    updateLanguage: updateLanguage,
    getLanguageById: getLanguageById,
    getAllLanguagesByCountryId: getAllLanguagesByCountryId,
    deleteLanguageById: deleteLanguageById,
    isLanguageExists: isLanguageExists,
    isLanguageNameExists: isLanguageNameExists
};