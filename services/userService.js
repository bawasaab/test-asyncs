const fs = require('fs');
var md5 = require('md5');
const jwt = require('jsonwebtoken');
const v = require('node-input-validator');
const ObjectId = require('mongodb').ObjectID;
const { UserModel } = require('../models').userModel;
const { DocumentModel } = require('../models').DocumentModel;
const communityService = require('./communityService');
const { userProfilePath, userGetProfilePath, JWT_SECRET, twillioCredentials ,documentPath} = require('../include/constants');
const { errorHelper } = require('../include/common');

let insertUser = async ( req ) => {

    try {

        let obj = req.body;
        let file = req.file;

        /** VALIDATIONS CONFIG STARTS HERE */
        let required = {
            first_name: 'required|minLength:3',
            // last_name: 'required|minLength:3',
            // nick_name: 'required|minLength:3',
            // email:'required|email',
            password: 'required|minLength:8',
            // speciality: 'required',
            login_type: 'required'
        };

       // 'work_experience' in obj ? required.work_experience : 'required|min:1',
        'email' in obj ? required.email : 'required|email',
        'gender' in obj ? required.gender : 'required',
       // 'country' in obj ? required.country : 'required',
        'social_id' in obj ? required.social_id = 'required' : '';
        'referral_code' in obj ? required.referral_code = 'required' : '';
        'phone' in obj ? required.phone = 'required|phoneNumber' : '';
        'role' in obj ? required.role = 'required' : '';
        'is_anonymous' in obj ? required.is_anonymous = 'required' : '';
        
        if( 'role' in obj ) {

            if( obj.role == 'PROFESSIONAL' ) {
    
                required.speciality = 'required';
                v.extend( 'speciality', async function ( field, value, args ) {
                
                    let allowedSpecialists = ['SURGEON'];
                    if( allowedSpecialists.indexOf(value) >= 0 ) {
                        return true;
                    }
                    return false;
                });
    
                required.work_experience = 'required|min:1';
    
            } else if( obj.role == 'CLIENT' ) {
    
                required.dob = 'required|date';
            }
        }

        let validator = new v( obj, required );

        if( 'is_anonymous' in obj ) {

            v.extend( 'is_anonymous', async function ( field, value, args ) {
            
                let allowedOptions = ['YES', 'NO'];
                if( allowedOptions.indexOf(value) >= 0 ) {
                    return true;
                }
                return false;
            });
        }

        if( 'gender' in obj ) {

            v.extend( 'gender', async function ( field, value, args ) {
                
                let allowedGenders = ['MALE', 'FEMALE'];
                if( allowedGenders.indexOf(value) >= 0 ) {
                    return true;
                }
                return false;
            });
        }

        if( 'login_type' in obj ) {
            v.extend( 'login_type', async function ( field, value, args ) {
                
                let allowedGenders = ['FACEBOOK', 'GOOGLE', 'NATIVE'];
                if( allowedGenders.indexOf(value) >= 0 ) {
                    return true;
                }
                return false;
            });
        }
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
            
            let flag = false;

            if( 'email' in obj ) {

                flag = true;
                let tmpReq = {
                    params: {
                        email: obj.email
                    }
                }
                let emailExists = await isEmailExists( tmpReq );
                if( emailExists.data.exists === 1 ) {
                    return {
                        status: 204,
                        message: 'Email exists already.',
                        data: null
                    };
                }
            }

            if( 'phone' in obj ) {

                flag = true;
                let tmpReq = {
                    params: {
                        phone: obj.phone
                    }
                }
                let phoneExists = await isPhoneExists( tmpReq );
                if( phoneExists.data.exists === 1 ) {
                    return {
                        status: 204,
                        message: 'Phone exists already.',
                        data: null
                    };
                }
            }

            if( 'social_id' in obj ) {

                flag = true;
                let tmpReq = {
                    params: {
                        social_id: obj.social_id
                    }
                }
                
                let socialIdExists = await isSocialIdExists( tmpReq );
                if( socialIdExists.data.exists === 1 ) {
                    return {
                        status: 204,
                        message: 'Social id exists already.',
                        data: null
                    };
                }
            }

            if( !flag ) {

                return {
                    status: 400,
                    message: 'One of the email, phone number or social_id must be provided!',
                    data: null
                };
            }

            let body = {
                email: obj.email,
                password: md5( obj.password ),
                role: obj.role,
                first_name: obj.first_name,
                last_name: obj.last_name,
                nick_name: obj.nick_name,
                dob: obj.dob,
                // speciality: obj.speciality,
                // work_experience: obj.work_experience,
                profile_image: file.filename,
                login_type: obj.login_type,
                gender: obj.gender,
                phone: obj.phone,
                referral_code: obj.referral_code,
                social_id: obj.social_id,
                // country: obj.country,
                is_anonymous: obj.is_anonymous,
                language_preferences: obj.language_preferences.toUpperCase().split(',')
            };
    
            let user = new UserModel( body );
            let savedUser = await user.save();
            var fullUrl = req.protocol + '://' + req.get('host') + '/' + userGetProfilePath + '/' + savedUser.profile_image;
            savedUser.profile_image = fullUrl;
            savedUser.password = undefined;
            
            return {
                status: 200,
                message: "user added successfully!",
                data: savedUser
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

let updateUser = async ( req ) => {

    try {
        
        let userId = ObjectId( req.params.userId );
        const user = await UserModel.findById( userId );
        if( user ) {

            let body = {};
            let obj = req.body;
            let file = req.files;
            let medical_proof,degree_proof,government_proof='';

            if( 'email' in obj ) {

                flag = true;
                let tmpReq = {
                    params: {
                        email: obj.email,
                        userId: userId
                    }
                }
                let emailExists = await isEmailExists( tmpReq );
                if( emailExists.data.exists === 1 ) {
                    return {
                        status: 204,
                        message: 'Email exists already.',
                        data: null
                    };
                }
            }

            if( 'phone' in obj ) {

                flag = true;
                let tmpReq = {
                    params: {
                        phone: obj.phone,
                        userId: userId
                    }
                }
                let phoneExists = await isPhoneExists( tmpReq );
                if( phoneExists.data.exists === 1 ) {
                    return {
                        status: 204,
                        message: 'Phone exists already.',
                        data: null
                    };
                }
            }

            if( 'social_id' in obj ) {

                flag = true;
                let tmpReq = {
                    params: {
                        social_id: obj.social_id,
                        userId: userId
                    }
                }
                
                let socialIdExists = await isSocialIdExists( tmpReq );
                if( socialIdExists.data.exists === 1 ) {
                    return {
                        status: 204,
                        message: 'Social id exists already.',
                        data: null
                    };
                }
            }

            'first_name'            in obj ? body.first_name = obj.first_name : body.first_name = user.first_name;
            'last_name'             in obj ? body.last_name = obj.last_name : body.last_name = user.last_name;
            'role'                  in obj ? body.role = obj.role : body.role = user.role;
            'gender'                in obj ? body.gender = obj.gender : body.gender = user.gender;
            'email'                 in obj ? body.email = obj.email : body.email = user.email;
            'password'              in obj ? body.password = md5( obj.password ) : body.password = user.password;
            'speciality'            in obj ? body.speciality = obj.speciality : body.speciality = user.speciality;
            'work_experience'       in obj ? body.work_experience = obj.work_experience : body.work_experience = user.work_experience;
            'language_preferences'  in obj ? body.language_preferences = obj.language_preferences.toUpperCase().split(',') : body.language_preferences = user.language_preferences;
            'login_type'            in obj ? body.login_type = obj.login_type : body.login_type = user.login_type;
            'social_id'             in obj ? body.social_id = obj.social_id : body.social_id = user.social_id;
            'phone'                 in obj ? body.phone = obj.phone : body.phone = user.phone;
            'country'               in obj ? body.country = obj.country : body.country = user.country;
            'profession'            in obj ? body.profession = obj.profession : body.profession = user.profession;
            'is_anonymous'          in obj ? body.is_anonymous = obj.is_anonymous : body.is_anonymous = user.is_anonymous;
            
            if( file != undefined && file.profile_image  ) {

                let filePath = userProfilePath + '/' + user.profile_image;
                fs.unlink( filePath, (err) => {
                    console.log( `${filePath} was deleted` );
                });
                file.profile_image.forEach(function(element) {
                    body.profile_image =  element['filename'];
                });
            } 
            if(file != undefined && file.medical_proof){
                file.medical_proof.forEach(function(element) {
                    medical_proof = element['filename'];
                });
            }
         
            if(file != undefined && file.degree_proof ){
                file.degree_proof.forEach(function(element) {
                    degree_proof = element['filename'];
                });
            }
         
            if(file != undefined && file.government_proof  ){
               
                file.government_proof.forEach(function(element) {
                   
                    government_proof = element['filename'];
                });
            }
            let docs = {
                medical_proof: medical_proof,
                degree_proof: degree_proof,
                government_proof: government_proof,
                userid: req.params.userId ,
            };

            let updatedUser = await UserModel.updateOne( { _id: userId }, body);
            let documents = new DocumentModel( docs );
            let docSaves = await documents.save();
            if( updatedUser ) {

                const user = await UserModel.findById( userId );
                var fullUrl = req.protocol + '://' + req.get('host') + '/' + userGetProfilePath + '/' + user.profile_image;
                user.profile_image = fullUrl;
                if( !user ) {
                    
                    return {
                        status: 400,
                        message: "unable to get user!",
                        data: null
                    };
                } else {
                    
                    if( 'is_anonymous' in obj ) {

                        let tmpReq = {
                            params: {
                                user_id: userId
                            },
                            body: {
                                is_anonymous: obj.is_anonymous
                            }
                        };
                        
                        let updatedStatus = await communityService.modifyPostAnonymousStatus( tmpReq );
                        console.log('updatedStatus', updatedStatus);
                    }

                    user.password = undefined;
                    return {
                        status: 200,
                        message: "user has been updated successfully!",
                        data: user,
                        updatedRecordsCount: updatedUser.n
                    };
                }
            } else {

                return {
                    status: 400,
                    message: "unable to update user!",
                    data: null
                };
            }
        } else {

            return {
                status: 204,
                message: "user does not exist",
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

let getUserById = async ( req ) => {

    try {
        
        let userId = ObjectId( req.params.userId );
        const user = await UserModel.findById( userId );
        const documents = await DocumentModel.findOne({'userid':userId });
        if( !user ) {

            return {
                status: 204,
                message: "user not found!",
                data: null,
                err: user
            };
        } else {
            
            var fullUrl = req.protocol + '://' + req.get('host') + '/' + userGetProfilePath + '/' + user.profile_image;
            user.profile_image = fullUrl;
            var docs = [];
             var Url = req.protocol + '://' + req.get('host') + '/' + documentPath + '/' ;
           if(documents){
             docs.push({medical_proof: Url + documents.medical_proof,degree_proof: Url + documents.degree_proof,government_proof: Url + documents.government_proof});
           }
            return {
                status: 200,
                message: "user found successfully!",
                data: user,
                documents:docs
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

let getUserByEmail = async ( email ) => {

    try {
        
        const user = await UserModel.findOne( { email: email } );
        if( !user ) {

            return {
                status: 204,
                message: "user not found!",
                data: null,
                err: user
            };
        } else {
            
            var fullUrl = req.protocol + '://' + req.get('host') + '/' + userGetProfilePath + '/' + user.profile_image;
            user.profile_image = fullUrl;
            return {
                status: 200,
                message: "user found successfully!",
                data: user
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

let getAllUsers = async ( req ) => {

    try {

        // Specify in the sort parameter the field or fields to sort by and a value of 1 or -1 to specify an ascending or descending sort respectively.
        const user = await UserModel.find().sort([['created_at', '-1']]);
        if( !user ) {

            return {
                status: 204,
                message: "users not found!",
                data: null,
                err: user
            };
        } else {
            
            return {
                status: 200,
                message: "users found successfully!",
                data: user
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

let deleteUserById = async ( req ) => {

    try {

        let userId = ObjectId( req.params.userId );
        const user = await UserModel.findById( userId );
        if( user ) {
            
            let filePath = userProfilePath + '/' + user.profile_image;
            fs.unlink( filePath, (err) => {
                // if (err) throw err;
                console.log( `${filePath} was deleted` );
            });

            let deleteUser = await UserModel.deleteOne( { _id: userId} );
            return {
                status: 200,
                message: "user deleted successfully!",
                data: deleteUser
            };
        } else {

            return {
                status: 204,
                message: "user does not exist",
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

let isEmailExists = async ( req ) => {

    try {

        /** VALIDATIONS CONFIG STARTS HERE */
        let email = req.params.email;
        let required = {
            email:'required|email',
        };
        let obj = {
            email: email
        };
        let validator = new v( obj, required );
        /** VALIDATIONS CONFIG ENDS HERE */

        let matched = await validator.check();
        if ( !matched ) {
          
            return {
                status: 400,
                message: ex.toString(),
                data: validator.errors
            };
        } else {

            const user = await UserModel.count( {email: email} );
            if( user ) {
    
                return {
                    status: 200,
                    message: "email exists!",
                    data: {
                        exists: 1,
                        user: await UserModel.findOne( {email: email} )
                    }
                };
            } else {
    
                return {
                    status: 204,
                    message: "email does not exist",
                    data: {
                        exists: 0,
                        user: {}
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

let isSocialIdExists = async ( req ) => {

    try {

        /** VALIDATIONS CONFIG STARTS HERE */
        let social_id = req.params.social_id;
        let required = {
            social_id:'required',
        };
        let obj = {
            social_id: social_id
        };
        let validator = new v( obj, required );
        /** VALIDATIONS CONFIG ENDS HERE */

        let matched = await validator.check();
        if ( !matched ) {
          
            return {
                status: 400,
                message: ex.toString(),
                data: validator.errors
            };
        } else {

            const user = await UserModel.findOne( {social_id: social_id} );
            if( user ) {
    
                return {
                    status: 200,
                    message: "social id exists!",
                    data: {
                        exists: 1,
                        user: await UserModel.findOne( {social_id: social_id} )
                    }
                    
                };
            } else {
    
                return {
                    status: 204,
                    message: "social id does not exist",
                    data: {
                        exists: 0,
                        user: {}
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

let isUserExists = async ( req ) => {

    try {

        let userId = ObjectId( req.params.userId );
        const user = await UserModel.count( {_id: userId} );
        if( user ) {

            return {
                status: 200,
                message: "user id exists!",
                data: {
                    exists: 1,
                    user: await UserModel.findOne( {_id: userId} )
                }
            };
        } else {

            return {
                status: 204,
                message: "user id does not exist",
                data: {
                    exists: 0,
                    user: {}
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

let isPhoneExists = async ( req ) => {

    try {

        /** VALIDATIONS CONFIG STARTS HERE */
        let phone = req.params.phone;
        let required = {
            phone:'required',
        };
        let obj = {
            phone: phone
        };
        let validator = new v( obj, required );
        /** VALIDATIONS CONFIG ENDS HERE */

        let matched = await validator.check();
        if ( !matched ) {
          
            return {
                status: 400,
                message: ex.toString(),
                data: validator.errors
            };
        } else {

            const user = await UserModel.count( {phone: phone} );
            if( user ) {
    
                return {
                    status: 200,
                    message: "phone exists!",
                    data: {
                        exists: 1,
                        user: await UserModel.findOne( {phone: phone} )
                    }
                };
            } else {
    
                return {
                    status: 204,
                    message: "phone does not exist",
                    data: {
                        exists: 0,
                        user: {}
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

let insertWebUser = async ( req ) => {
    
    try {

        let obj = req.body;
        let file = req.file;

        /** VALIDATIONS CONFIG STARTS HERE */
        let required = {
            first_name: 'required|minLength:3',
            last_name: 'required|minLength:3',
            email:'required|email',
            password: 'required|minLength:8',
        };

        'work_experience' in obj ? required.work_experience : 'required|min:1',
        'phone' in obj ? required.phone : 'required',
        'social_id' in obj ? required.social_id = 'required' : '';
        required.speciality = 'required';
        // v.extend( 'speciality', async function ( field, value, args ) {
        
        //     let allowedSpecialists = ['SURGEON'];
        //     if( allowedSpecialists.indexOf(value) >= 0 ) {
        //         return true;
        //     }
        //     return false;
        // });
        required.work_experience = 'required|min:1';

        let validator = new v( obj, required );

        v.extend( 'login_type', async function ( field, value, args ) {
            
            let allowedGenders = ['FACEBOOK', 'GOOGLE', 'NATIVE'];
            if( allowedGenders.indexOf(value) >= 0 ) {
                return true;
            }
            return false;
        });
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
            
            let flag = false;

            if( 'email' in obj ) {

                flag = true;
                let tmpReq = {
                    params: {
                        email: obj.email
                    }
                }
                let emailExists = await isEmailExists( tmpReq );
                if( emailExists.data.exists === 1 ) {
                    return {
                        status: 204,
                        message: 'Email exists already.',
                        data: null
                    };
                }
            }

            if( 'phone' in obj ) {

                flag = true;
                let tmpReq = {
                    params: {
                        phone: obj.phone
                    }
                }
                let phoneExists = await isPhoneExists( tmpReq );
                if( phoneExists.data.exists === 1 ) {
                    return {
                        status: 204,
                        message: 'Phone exists already.',
                        data: null
                    };
                }
            }

            // if( 'social_id' in obj ) {

            //     flag = true;
            //     let tmpReq = {
            //         params: {
            //             social_id: obj.social_id
            //         }
            //     }
                
            //     let socialIdExists = await isSocialIdExists( tmpReq );
            //     if( socialIdExists.data.exists === 1 ) {
            //         return {
            //             status: 204,
            //             message: 'Social id exists already.',
            //             data: null
            //         };
            //     }
            // }

            if( !flag ) {

                return {
                    status: 400,
                    message: 'One of the email, phone number or social_id must be provided!',
                    data: null
                };
            }
            
            let body = {
                email: obj.email,
                password: md5( obj.password ),
                role: obj.role,
                first_name: obj.first_name,
                last_name: obj.last_name,
                speciality: obj.speciality,
                work_experience: obj.work_experience,
                profile_image: file.filename,
                login_type: obj.login_type,
                phone: obj.phone,
                referral_code: obj.referral_code,
                social_id: obj.social_id,
                is_anonymous: obj.is_anonymous,
                profession: obj.profession,
                language_preferences: obj.language_preferences.toUpperCase().split(',')
            };
    
            let user = new UserModel( body );
            let savedUser = await user.save();
            var fullUrl = req.protocol + '://' + req.get('host') + '/' + userGetProfilePath + '/' + savedUser.profile_image;
            savedUser.profile_image = fullUrl;
            savedUser.password = undefined;
            
            return {
                status: 200,
                message: "user added successfully!",
                data: savedUser
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

let changePassword = async ( req ) => {
    try {

        /** VALIDATIONS CONFIG STARTS HERE */
        let obj = req.body;
        let current_password = req.body.current_password;
        let new_password = req.body.new_password;
        let user_id = ObjectId(req.body.userId);
        let required = {
            current_password:'required',
            new_password:'required',
        };
        let validator = new v( obj, required );
        /** VALIDATIONS CONFIG ENDS HERE */

        let matched = await validator.check();
        if ( !matched ) {
          let msg = await errorHelper( validator.errors );
            return {
                status: 400,
                message: msg,
                data: validator.errors
            };
        } else {
            const user = await UserModel.findById( {_id: user_id} );
            if( user ) {
                if(user.password !== md5(current_password )){
                    return {
                        status: 400,
                        message: "Current password does not match"
                    };
                }
                let body = {};
                body.password = md5( new_password );
                let updatedUser = await UserModel.updateOne( { _id: user_id }, body);
                if(updatedUser){
                    return {
                        status: 200,
                        message: "Password successfully updated",
                    };
                }else{
                    return {
                        status: 400,
                        message: "Error in updating password",
                    };
                }
            } else {
    
                return {
                    status: 204,
                    message: "User does not exist",
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

let doctoravailability = async ( req ) => {
    try {
        var time_slot_arr = [];
        req.body.time_slot.forEach(function(entry) {
            time_slot_arr.push({
                from: entry.from, 
                to:  entry.to
            });
        });
        /** VALIDATIONS CONFIG STARTS HERE */
        let obj = req.body;
        let required = { };
        'available_days' in obj ? required.available_days : 'required';
        'available_time' in obj ? required.available_time : 'required';
        'time_slot' in obj ? required.time_slot : 'required';

        let validator = new v( obj, required );
        /** VALIDATIONS CONFIG ENDS HERE */

        let matched = await validator.check();
        if ( !matched ) {
          let msg = await errorHelper( validator.errors );
            return {
                status: 400,
                message: msg,
                data: validator.errors
            };
        } else {
            userid = ObjectId(obj.userid);
            //return userid;
            const user = await UserModel.findById( {_id: userid} );
            if( user ) {
                let body = {};
                body.available_days = obj.available_days;
                body.available_time = obj.available_time;
                body.time_slot = time_slot_arr;
                let updatedUser = await UserModel.updateOne( { _id: userid }, body);
                if(updatedUser){
                    return {
                        status: 200,
                        message: "Record added successfully",
                    };
                }else{
                    return {
                        status: 400,
                        message: "Error in updating record",
                    };
                }
            } else {
    
                return {
                    status: 204,
                    message: "User does not exist",
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

module.exports = {
    insertUser: insertUser,
    updateUser: updateUser,
    getUserById: getUserById,
    getAllUsers: getAllUsers,
    deleteUserById: deleteUserById,
    isEmailExists: isEmailExists,
    isSocialIdExists: isSocialIdExists,
    isUserExists: isUserExists,
    isPhoneExists: isPhoneExists,
    getUserByEmail: getUserByEmail,
    insertWebUser:insertWebUser,
    changePassword:changePassword,
    doctoravailability:doctoravailability
};