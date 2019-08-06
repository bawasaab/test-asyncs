const fs = require('fs');
var md5 = require('md5');
const ObjectId = require('mongodb').ObjectID;
const v = require('node-input-validator');
const generator = require('generate-password');

const { CareReceiverModel } = require('../models').CareReceiverModel;

const { UserModel } = require('../models').userModel;

const userService = require('./userService');
const { userGetProfilePath, userFullProfilePath, baseUrl } = require('../include/constants');
const { errorHelper } = require('../include/common');

const MailConfig = require('../config/email');
const hbs = require('nodemailer-express-handlebars');
const gmailTransport = MailConfig.GmailTransport;

let insertCareReceiver = async ( req ) => {

    try {
        
        let care_giver_id = ObjectId( req.body.care_giver_id );
        let obj = req.body;
        let file = req.file;

        const CareReceiver = await UserModel.findOne( { email: obj.email } );
        if( CareReceiver ) {
            return {
                status: 204,
                message: "Email Already exists.",
                data: null
            };
        }

        /** VALIDATIONS CONFIG STARTS HERE */
        let required = {
            care_giver_id: 'required',
            name: 'required',
            email:'required|email',
            phone: 'required',
            is_care_receiver_minor: 'required',
            relationship: 'required'
        };

        let validator = new v( obj, required );

        v.extend( 'is_care_receiver_minor', async function ( field, value, args ) {
            
            let allowedGenders = ['YES', 'NO'];
            if( allowedGenders.indexOf(value) >= 0 ) {
                return true;
            }
            return false;
        });

        v.extend( 'relationship', async function ( field, value, args ) {
            
            let allowedGenders = ['FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'FRIEND'];
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

            let in_obj = {
                params: {
                    userId: care_giver_id
                }
            };
            
            let isUserExists = await userService.isUserExists( in_obj );
            if( isUserExists.status != 200 ) {

                return {
                    status: 400,
                    message: 'Care giver id is invalid.',
                    data: null
                };
            } else {

                let password = generator.generate({
                    length: 10,
                    numbers: true
                });

                password = password + '@';
                let in_password = md5( password );
    
                let body = {
                    care_giver_id: ObjectId( obj.care_giver_id ),
                    first_name: obj.name,
                    email: obj.email,
                    password: in_password,
                    phone: obj.phone,
                    is_care_receiver_minor: obj.is_care_receiver_minor,
                    relationship: obj.relationship,
                    profile_image: file.filename
                };
        
                let user = new UserModel( body );
                let savedCareReceiver = await user.save();
                var fullUrl = userFullProfilePath + savedCareReceiver.profile_image;
                savedCareReceiver.profile_image = fullUrl;

                if( obj.is_care_receiver_minor != 'YES' ) {

                    // get user by id
                    const user = await UserModel.findById( care_giver_id );

                    let template = `<html lang="en">
                                        <head>
                                            <meta charset="utf-8">
                                            <meta http-equiv="X-UA-Compatible" content="IE=edge">
                                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                            <meta http-equiv="Cache-Control" content="no-cache">
                                            <title>iGetHappy</title>
                                        </head>
                                        <body>
                                            <table style="border: 0; width: 100%; margin: 0 auto;">
                                                <tr>
                                                    <td style="text-align: center; padding-bottom: 50px; padding-top: 40px">
                                                        <img src="https://stgsp1.appsndevs.com/Championsfarm/igethappy/assets/images/logo-white.svg" alt="logo">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: center; padding-bottom: 15px;">
                                                        <p style=" font-family: arial; font-size: 40px; font-weight: bold; color: #333; margin: 0px auto;">Welcome to iGetHappy</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: center; padding-bottom: 15px;">
                                                        <p style="font-family: arial; font-size: 18px; color: #333; line-height: 26px;"><b>${user.first_name} ${user.last_name}</b> wants to add you in iGetHappy as a care receiver.</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: center; padding-bottom: 15px; padding-top: 20px;">
                                                        <a href="${baseUrl}/careReceivers/sendLoginCredentialsByCareReceiverId/${savedCareReceiver._id}/YES" style=" font-family: arial; background-color: #FF5E4B; padding: 8px 15px; border: 2px solid #F03823; color: #fff; font-size: 16px; border-radius: 5px; text-transform: uppercase; cursor: pointer;">Yes</a>
                                                        <a href="${baseUrl}/careReceivers/sendLoginCredentialsByCareReceiverId/${savedCareReceiver._id}/NO" style=" font-family: arial; background-color: #686868; padding: 8px 15px; border: 2px solid #656565; color: #fff; font-size: 16px; border-radius: 5px; text-transform: uppercase; cursor: pointer; min-width: 30px; display: inline-block;">No</a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </body>
                                    </html>`;

                    let HelperOptions = {
                        from: `iGetHappy <deepak4bawa@gmail.com>`,
                        to: obj.email,
                        subject: 'Welcome to iGetHappy.!',
                        html: template
                    };

                    gmailTransport.sendMail(HelperOptions, (error,info) => {
                        if(error) {
                            
                            console.log(`Error sending email while inserting care receiver ${obj.email}.`, error);
                        } else {
    
                            console.log("Email sent successfully!", info);
                        }
                    }); 
                }
                
                return {
                    status: 200,
                    message: "Care receiver added successfully.",
                    data: savedCareReceiver
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

let updateCareReceiver = async ( req ) => {

    try {
        
        let care_receiver_id = ObjectId( req.params.care_receiver_id );
        const CareReceiver = await UserModel.findById( care_receiver_id );
        if( CareReceiver ) {

            let body = {};
            let obj = req.body;
            let file = req.file;

            'care_giver_id'            in obj ? body.care_giver_id = ObjectId( obj.care_giver_id ) : body.care_giver_id = ObjectId( CareReceiver.care_giver_id );
            'name'                     in obj ? body.first_name = obj.name : body.name = CareReceiver.name;
            'email'                    in obj ? body.email = obj.email : body.email = CareReceiver.email;
            'phone'                    in obj ? body.phone = obj.phone : body.phone = CareReceiver.phone;
            'is_care_receiver_minor'   in obj ? body.is_care_receiver_minor = obj.is_care_receiver_minor : body.is_care_receiver_minor = CareReceiver.is_care_receiver_minor;
            'relationship'             in obj ? body.relationship = obj.relationship : body.relationship = CareReceiver.relationship;
            
            let updatedCareReceiver = await UserModel.updateOne( { _id: care_receiver_id }, body);
            if( updatedCareReceiver ) {

                const CareReceiver = await UserModel.findById( care_receiver_id );
                if( !CareReceiver ) {

                    return {
                        status: 400,
                        message: "unable to get care receiver.",
                        data: null
                    };
                } else {
                    
                    return {
                        status: 200,
                        message: "Care receiver has been updated successfully.",
                        data: CareReceiver,
                        updatedRecordsCount: CareReceiver.n
                    };
                }
            } else {

                return {
                    status: 400,
                    message: "unable to update care receiver.",
                    data: null
                };
            }
        } else {

            return {
                status: 204,
                message: "Care receiver does not exist",
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

let getCareReceiverById = async ( req ) => {

    try {
        
        let care_receiver_id = ObjectId( req.params.care_receiver_id );
        const CareReceiver = await UserModel.findOne( { _id: care_receiver_id, care_giver_id: { $ne: -1 } } );
        if( !CareReceiver ) {

            return {
                status: 204,
                message: "Care Receiver not found.",
                data: null,
                err: CareReceiver
            };
        } else {
            
            var fullUrl = userFullProfilePath + CareReceiver.profile_image;
            CareReceiver.profile_image = fullUrl;
            return {
                status: 200,
                message: "CareReceiver found successfully.",
                data: CareReceiver
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

let getCareReceiverByEmail = async ( email ) => {

    try {
        
        const CareReceiver = await UserModel.findOne( { email: email, care_giver_id: { $ne: -1 } } );
        if( !CareReceiver ) {

            return {
                status: 204,
                message: "Care Receiver not found.",
                data: null,
                err: CareReceiver
            };
        } else {
            
            var fullUrl = userFullProfilePath + CareReceiver.profile_image;
            CareReceiver.profile_image = fullUrl;
            return {
                status: 200,
                message: "CareReceiver found successfully.",
                data: CareReceiver
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

let getAllCareReceiver = async ( req ) => {

    try {

        // Specify in the sort parameter the field or fields to sort by and a value of 1 or -1 to specify an ascending or descending sort respectively.
        const CareReceiver = await CareReceiverModel.find().sort([['created_at', '-1']]);
        if( !CareReceiver ) {

            return {
                status: 204,
                message: "Care receiver not found.",
                data: null,
                err: CareReceiver
            };
        } else {
            
            return {
                status: 200,
                message: "Care receiver found successfully.",
                data: CareReceiver,
                profilePath: userFullProfilePath
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

let getByCareGiverId = async ( req ) => {

    try {

        let care_giver_id = ObjectId( req.params.care_giver_id );
        // Specify in the sort parameter the field or fields to sort by and a value of 1 or -1 to specify an ascending or descending sort respectively.
        const CareReceiver = await UserModel.find({
            care_giver_id: care_giver_id
        }).sort([['created_at', '-1']]);
        if( !CareReceiver ) {

            return {
                status: 204,
                message: "Care receivers not found.",
                data: null,
                err: CareReceiver
            };
        } else {
            
            return {
                status: 200,
                message: "Care receivers found successfully.",
                data: CareReceiver,
                profilePath: userFullProfilePath
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

let deleteCareReceiverById = async ( req ) => {

    try {

        let care_receiver_id = ObjectId( req.params.care_receiver_id );
        const CareReceiver = await UserModel.findOne( { _id: care_receiver_id, care_giver_id: { $ne: -1 } } );
        if( CareReceiver ) {

            let deleteCareReceiver = await UserModel.deleteOne( { _id: care_receiver_id} );
            return {
                status: 200,
                message: "Care receiver deleted successfully.",
                data: null
            };
        } else {

            return {
                status: 204,
                message: "Care receiver does not exist",
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
            
            const CareReceiver = await UserModel.count( {email: email} );
            if( CareReceiver ) {
    
                return {
                    status: 200,
                    message: "email exists.",
                    data: {
                        exists: CareReceiver
                    }
                };
            } else {
    
                return {
                    status: 204,
                    message: "email does not exist",
                    data: {
                        exists: CareReceiver
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

let isCareReceiverExists = async ( req ) => {

    try {

        let care_receiver_id = ObjectId( req.params.care_receiver_id );
        const CareReceiver = await UserModel.count( {_id: care_receiver_id} );
        if( CareReceiver ) {

            return {
                status: 200,
                message: "Care receiver id exists.",
                data: {
                    exists: CareReceiver
                }
            };
        } else {

            return {
                status: 204,
                message: "Care receiver id does not exist",
                data: {
                    exists: CareReceiver
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

let sendLoginCredentialsByCareReceiverId = async ( req ) => {
    
    try {

        // get care receiver id
        let care_receiver_id = ObjectId( req.params.care_receiver_id );
        let operation = req.params.operation;
        let msg = '';

        // check inputs
        let required = {
            care_receiver_id: 'required',
            operation: 'required',
        };
        let obj = {
            care_receiver_id: care_receiver_id,
            operation: operation
        };

        let validator = new v( obj, required );

        v.extend( 'operation', async function ( field, value, args ) {

            let allowedGenders = ['YES', 'NO'];
            if( allowedGenders.indexOf(value) >= 0 ) {
                return true;
            }
            return false;
        });

        let matched = await validator.check();
        if ( !matched ) {
            
            let msg = await errorHelper( validator.errors );
            return {
                status: 400,
                message: msg,
                data: null
            };
        } else {

            // check if care receiver exists
            let isExists = await isCareReceiverExists( req );
            if( isExists.data.exists != 1 ) {
                
                return {
                    status: 204,
                    message: "Care receiver does not exist",
                    data: null
                };
            }

            // get care receiver by id from DB
            let care_receiver = await getCareReceiverById( req );
            if( care_receiver.status != 200 ) {

                return care_receiver;
            }

            // check if care receiver already logged in once to the portal if so return link expired
            if( care_receiver.data.id_logged_in_already == 'YES' ) {

                return {
                    status: 400,
                    message: 'Link expired.',
                    data: null
                };
            }

            let care_receiver_email = care_receiver.data.email;

            // check if user clicks yes or no button.
            if( operation == 'YES' ) {

                // else generate and update the password
                let password = generator.generate({
                    length: 10,
                    numbers: true
                });

                password = password + '@';
                let in_password = md5( password );
                care_receiver.password = in_password;

                let updatedCareReceiver = await UserModel.updateOne( { _id: care_receiver_id }, care_receiver);
                if( updatedCareReceiver ) {

                    // create email template
                    let template = `<html lang="en">
                                        <head>
                                            <meta charset="utf-8">
                                            <meta http-equiv="X-UA-Compatible" content="IE=edge">
                                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                            <meta http-equiv="Cache-Control" content="no-cache">
                                            <title>iGetHappy</title>
                                        </head>
                                        <body>
                                            <table style="border: 0; width: 100%; margin: 0 auto;">
                                                <tr>
                                                    <td style="text-align: center; padding-bottom: 50px; padding-top: 40px">
                                                        <img src="https://stgsp1.appsndevs.com/Championsfarm/igethappy/assets/images/logo-white.svg" alt="logo">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: center; padding-bottom: 15px;">
                                                        <p style=" font-family: arial; font-size: 40px; font-weight: bold; color: #333; margin: 0px auto;">Welcome to iGetHappy</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: center; padding-bottom: 15px;">
                                                        <p style="font-family: arial; font-size: 16px; color: #333; line-height: 26px;">
                                                            <u>Login credentials</u>: <br>
                                                            <b>Email</b>: ${care_receiver_email} <br>
                                                            <b>Password</b>: ${password}
                                                        </p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: center; padding-bottom: 15px; padding-top: 20px;">
                                                        <a href="https://www.google.com/" style=" font-family: arial; background-color: #FF5E4B; padding: 8px 15px; border: 2px solid #F03823; color: #fff; font-size: 16px; border-radius: 5px; text-transform: uppercase; cursor: pointer;">Link to iGetHappy</a> 
                                                        <!-- <a href="https://www.google.com/" style=" font-family: arial; background-color: #686868; padding: 8px 15px; border: 2px solid #656565; color: #fff; font-size: 16px; border-radius: 5px; text-transform: uppercase; cursor: pointer; min-width: 30px; display: inline-block;">Link to iGetHappy</a> -->
                                                    </td>
                                                </tr>
                                            </table>
                                        </body>
                                    </html>`;

                    let HelperOptions = {
                        from: `iGetHappy <deepak4bawa@gmail.com>`,
                        to: care_receiver_email,
                        subject: 'Welcome to iGetHappy.!',
                        html: template
                    };

                    // send email with new login credentials
                    gmailTransport.sendMail(HelperOptions, (error,info) => {
                        if(error) {
                            
                            console.log(`Error sending email while inserting care receiver ${obj.email}.`, error);
                        } else {

                            console.log("Email sent successfully!", info);
                        }
                    }); 

                    msg = 'Login credentials are mailed to your registered email.';
                } else {

                    return {
                        status: 400,
                        message: 'Not able to generate and update password.',
                        data: null
                    };
                }
            } else {

                let isCareReceiverDeleted = await deleteCareReceiverById( req );
                if( isCareReceiverDeleted.status == 200 ) {

                    // create email template
                    let template = `<html lang="en">
                                        <head>
                                            <meta charset="utf-8">
                                            <meta http-equiv="X-UA-Compatible" content="IE=edge">
                                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                            <meta http-equiv="Cache-Control" content="no-cache">
                                            <title>iGetHappy</title>
                                        </head>
                                        <body>
                                            <table style="border: 0; width: 100%; margin: 0 auto;">
                                                <tr>
                                                    <td style="text-align: center; padding-bottom: 50px; padding-top: 40px">
                                                        <img src="https://stgsp1.appsndevs.com/Championsfarm/igethappy/assets/images/logo-white.svg" alt="logo">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: center; padding-bottom: 15px;">
                                                        <p style=" font-family: arial; font-size: 40px; font-weight: bold; color: #333; margin: 0px auto;">Welcome to iGetHappy</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="text-align: center; padding-bottom: 15px;">
                                                        <p style="font-family: arial; font-size: 18px; color: #333; line-height: 26px;">
                                                            This is to inform you that your acount with <b>email: ${care_receiver_email}</b> has been successfully removed.
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </body>
                                    </html>`;

                    let HelperOptions = {
                        from: `iGetHappy <deepak4bawa@gmail.com>`,
                        to: care_receiver_email,
                        subject: 'Welcome to iGetHappy.!',
                        html: template
                    };

                    // send email with new login credentials
                    gmailTransport.sendMail(HelperOptions, (error,info) => {
                        if(error) {
                            
                            console.log(`Error sending email while inserting care receiver ${obj.email}.`, error);
                        } else {

                            console.log("Email sent successfully!", info);
                        }
                    }); 
                    
                    msg = 'Your account status is mailed to your registered email.';
                } else {

                    return {
                        status: 400,
                        message: 'Unable to delete care receiver.',
                        data: null
                    };
                }
            }
    
            // return response
            return {
                status: 200,
                message: msg,
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

module.exports = {
    insertCareReceiver: insertCareReceiver,
    updateCareReceiver: updateCareReceiver,
    getCareReceiverById: getCareReceiverById,
    getByCareGiverId: getByCareGiverId,
    getCareReceiverByEmail: getCareReceiverByEmail,
    getAllCareReceiver: getAllCareReceiver,
    deleteCareReceiverById: deleteCareReceiverById,
    isEmailExists: isEmailExists,
    isCareReceiverExists: isCareReceiverExists,
    sendLoginCredentialsByCareReceiverId: sendLoginCredentialsByCareReceiverId
};