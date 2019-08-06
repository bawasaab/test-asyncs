const fs = require('fs');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const v = require('node-input-validator');
const generator = require('generate-password');
var sizeOf = require('image-size');

const MailConfig = require('../config/email');
const hbs = require('nodemailer-express-handlebars');
const gmailTransport = MailConfig.GmailTransport;

const ObjectId = require('mongodb').ObjectID;
const { UserModel } = require('../models').userModel;
const { JWT_SECRET, twillioCredentials, userFullProfilePath } = require('../include/constants');
const { errorHelper } = require('../include/common');
const { isUserExists } = require('../services/userService');

let completeUserDetails = async ( req, userId ) => {

    try {

        const user = await UserModel.findOne( { _id: userId } );
        if( !user ) {
            
            return {
                status: 204,
                message: `Invalid user!`,
                data: null
            };
        } else {

            let fullUrl;
            if( user.profile_image ) {

                fullUrl = userFullProfilePath + user.profile_image;
            } else {

                fullUrl = '';
            }
            
            // let dimensions = await sizeOf( userProfilePath +'/'+ user.profile_image );            
            
            user.profile_image = fullUrl;
            user.password = undefined;
            let token = await jwt.sign( {userId: user._id}, JWT_SECRET, { expiresIn: 60 * 60 * 24 } );
            return {
                status: 200,
                message: "user logged in successfully!",
                data: user,
                // userProfileImageDetails: {
                //     image: user.profile_image,
                //     fullUrl: fullUrl,
                //     dimensions: dimensions
                // },
                token: 'bearer '+ token
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

let logIn = async ( req ) => {

    try {
        
        let obj = req.body;
        let flag = false;
        let search = {};
        let errMsg = '';

        /** VALIDATIONS CONFIG STARTS HERE */
        let required = {};

        if( 'email' in obj ) {

            required.email = 'required|email';
            required.password = 'required|minLength:8';
            search.email = obj.email;
            errMsg = 'email';
        } else if( 'phone' in obj ) {

            required.phone = 'required|phoneNumber';
            required.password = 'required|minLength:8';
            search.phone = obj.phone;
            errMsg = 'phone';
        } else if( 'social_id' in obj ) {

            required.social_id = 'required';
            search.social_id = obj.social_id;
            errMsg = 'social id';
        } else {

            flag = true;
        }
        /** VALIDATIONS CONFIG ENDS HERE */

        if( flag ) {

            throw new Error('Incorrect inputs! One of phone, email, social_id must be provided!'); 
        } else {
            
            let validator = new v( obj, required );
            let matched = await validator.check();
            if ( !matched ) {

                let msg = await errorHelper( validator.errors );
                return {
                    status: 400,
                    message: msg,
                    data: null
                };
            } else {
                
                const user = await UserModel.findOne( search );
                if( !user ) {
                    
                    return {
                        status: 204,
                        message: `Invalid ${errMsg}!`,
                        data: null
                    };
                } else {
                    
                    if( errMsg != 'social id' && 'password' in obj ) {

                        let password = md5( obj.password );
                        if( user.password !== password ) {
                            
                            return {
                                status: 400,
                                message: "Incorrect Password!",
                                data: null
                            };
                        } else {

                            if( user.is_care_receiver_minor !== 'YES' ) {

                                let user_details = await completeUserDetails( req, user._id );
                                if( user_details && user_details.data.id_logged_in_already == 'NO' ) {

                                    let in_user = user_details.data;
                                    in_user.id_logged_in_already = 'YES';
                                    let updatedUser = await UserModel.updateOne( { _id: user._id }, in_user);
                                }
                                return user_details;
                            } else {

                                return {
                                    status: 400,
                                    message: "Unable to login because user is minor!",
                                    data: null
                                };
                            }
                        }
                    } else {
                        
                        if( user.is_care_receiver_minor !== 'YES' ) {

                            let user_details =  await completeUserDetails( req, user._id );
                            if( user_details && user_details.data.id_logged_in_already == 'NO' ) {

                                let in_user = user_details.data;
                                in_user.id_logged_in_already = 'YES';
                                let updatedUser = await UserModel.updateOne( { _id: user._id }, in_user);
                            }
                            return user_details;
                        } else {

                            return {
                                status: 400,
                                message: "Unable to login because user is minor!",
                                data: null
                            };
                        }
                    }
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

let verifyToken = async ( req ) => {

    try {

        //Request header with authorization key
        const bearerHeader = req.headers['authorization'];
        
        //Check if there is  a header
        if(typeof bearerHeader !== 'undefined') {

            const bearer = bearerHeader.split(' ');
            
            //Get Token arrray by spliting
            const bearerToken = bearer[1];
            req.token = bearerToken;
            
            let result = await jwt.verify( req.token, JWT_SECRET );
            req.authData = result;
            return {
                status: 200,
                message: "token verified!",
                data: result
            };
        } else {
            
            return {
                status: 400,
                message: 'Header is not defined.',
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

let logOut = async ( req ) => {
    
    return {
        status: 200,
        message: "user successfully logged out!",
        data: null
    };
}

let forgotPassword = async ( req, cb ) => {

    try {
        
        let obj = req.body;
        let flag = false;
        let search = {};
        let errMsg = '';

        /** VALIDATIONS CONFIG STARTS HERE */
        let required = {};

        if( 'email' in obj ) {

            required.email = 'required|email';
            search.email = obj.email;
            errMsg = 'E-mail address';
        } else if( 'phone' in obj ) {

            required.phone = 'required|phoneNumber';
            search.phone = obj.phone;
            errMsg = 'Phone number';
        } else {

            flag = true;
        }
        /** VALIDATIONS CONFIG ENDS HERE */

        if( flag ) {

            throw new Error('Incorrect inputs! One of phone or email must be provided!'); 
        } else {
            
            let validator = new v( obj, required );
            let matched = await validator.check();
            if ( !matched ) {
                
                let msg = await errorHelper( validator.errors );
                return {
                    status: 400,
                    message: msg,
                    data: null
                };
            } else {

                const user = await UserModel.findOne( search );
                if( !user ) {
                    
                    return {
                        status: 204,
                        message: `${errMsg} is not regestered.`,
                        data: null
                    };
                } else {
                    
                    /**
                     * reff
                     * https://medium.com/@tariqul.islam.rony/sending-email-through-express-js-using-node-and-nodemailer-with-custom-functionality-a999bb7cd13c
                     * 
                     * reff 2
                     * https://stackoverflow.com/questions/45478293/username-and-password-not-accepted-when-using-nodemailer
                     */

                    let password = generator.generate({
                        length: 10,
                        numbers: true
                    });

                    password = password + '@';
                    let in_password = md5( password );

                    if( 'email' in obj ) {                        

                        let updatedUser = await UserModel.updateOne( { email: obj.email }, { password: in_password });
                        if( updatedUser ) {

                            let HelperOptions = {
                                from: `iGetHappy <deepak4bawa@gmail.com>`,
                                to: obj.email,
                                subject: 'New password!',
                                text: `Your new password is: ${password}`
                            };
    
                            // let result = await gmailTransport.sendMail( HelperOptions );
                            // console.log('result2', result);
                            // console.log('result.error', result.error);
                            
                            gmailTransport.sendMail(HelperOptions, (error,info) => {
                                if(error) {
                                    
                                    console.log("Error sending email!", error);
                                } else {
    
                                    console.log("Email sent successfully!", info);
                                }
                            }); 
    
                            return {
                                status: 200,
                                message: `Your new password is sent to your email successfully!`,
                                data: null
                            };
                        } else {

                            return {
                                status: 400,
                                message: "unable to generate new password using user email!",
                                data: null
                            };
                        }
                    } else if( 'phone' in obj ) {

                        let updatedUser = await UserModel.updateOne( { phone: obj.phone }, { password: in_password });
                        if( updatedUser ) {

                            // DO CODE HERE TO SEND MOBILE OTP 
                            // const accountSid = 'AC9eee1a3621c7d027645a72e3056c438e';
                            // const authToken = 'c671a1a8258b8e11ae0a70f6121614a3';

                            const accountSid = twillioCredentials.accountSid;
                            const authToken = twillioCredentials.authToken;

                            const client = require('twilio')(accountSid, authToken);

                            const result = await client.messages.create({
                                to: obj.phone, // Any number Twilio can deliver to
                                from: '+19704318585', // A number you bought from Twilio and can use for outbound communication
                                body: `Your new password is ${password}` // body of the SMS message
                            });
                            console.log('sms result', result);

                            return {
                                status: 200,
                                message: `Your new password is sent to your contact number successfully!`,
                                data: null
                            };
                        } else {

                            return {
                                status: 400,
                                message: "unable to generate new password using user phone!",
                                data: null
                            };
                        }
                    }
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

let decodeToken = async ( req ) => {

    try {

        //Request header with authorization key
        const bearerHeader = req.headers['authorization'];
        
        //Check if there is  a header
        if(typeof bearerHeader !== 'undefined') {

            const bearer = bearerHeader.split(' ');
            
            //Get Token arrray by spliting
            const bearerToken = bearer[1];
            req.token = bearerToken;
            
            let result = await jwt.decode( req.token );
            let userId = result.userId;
            let out_data = await completeUserDetails( req, userId );
            delete out_data.token;
            out_data.message = 'Token decoded successfully.';
            return out_data;
        } else {
            
            return {
                status: 400,
                message: 'Header is not defined.',
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

let refreshToken = async ( req ) => {

    try {

        /** VALIDATIONS CONFIG STARTS HERE */
        let required = {};
        required.user_id = 'required';

        let obj = req.body;
        let validator = new v( obj, required );
        let matched = await validator.check();
        if ( !matched ) {

            let msg = await errorHelper( validator.errors );
            return {
                status: 400,
                message: msg,
                data: null
            };
        } else {
            
            let in_user_id = req.body.user_id;

            //Request header with authorization key
            const bearerHeader = req.headers['authorization'];
            
            //Check if there is  a header
            if(typeof bearerHeader !== 'undefined') {
    
                const bearer = bearerHeader.split(' ');
                
                //Get Token arrray by spliting
                const bearerToken = bearer[1];
                req.token = bearerToken;
                
                let result = await jwt.decode( req.token );
                if( result == null ) {
                    
                    return {
                        status: 400,
                        message: 'Invalid Token.',
                        data: null
                    };
                }
                let userId = result.userId;    
                if( in_user_id == userId ) {
                    
                    let tmpReq = {
                        params: {
                            userId: userId
                        }
                    };
                    let isExists = await isUserExists( tmpReq );
                    if( isExists.data.exists == 1 ) {

                        let user_details = await completeUserDetails( req, userId );
                        user_details.message = 'Token refreshed successfully.';
                        return user_details;
                    } else {

                        return {
                            status: 400,
                            message: 'User not found.',
                            data: null
                        };
                    }
                } else {
    
                    return {
                        status: 400,
                        message: 'Token and user id must be identical.',
                        data: null
                    };
                }    
            } else {
                
                return {
                    status: 400,
                    message: 'Header is not defined.',
                    data: null
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
    logIn: logIn,
    logOut: logOut,
    verifyToken: verifyToken,
    forgotPassword: forgotPassword,
    decodeToken: decodeToken,
    refreshToken: refreshToken
};