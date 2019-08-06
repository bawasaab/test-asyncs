const fs = require('fs');
var md5 = require('md5');
const jwt = require('jsonwebtoken');
const v = require('node-input-validator');
const ObjectId = require('mongodb').ObjectID;
const { PostModel } = require('../models').PostModel;
const { PostLikesModel } = require('../models').PostLikesModel;
const { errorHelper } = require('../include/common');

const { postProfilePath, postFullProfilePath, userFullProfilePath } = require('../include/constants');

let insertPost = async ( req ) => {

    try {

        let obj = req.body;
        let file = req.file;

        /** VALIDATIONS CONFIG STARTS HERE */
        let required = {
            user_id: 'required',
            // description: 'required|minLength:20',
            privacy_option: 'required',
            is_anonymous: 'required',
            post_upload_type: 'required'
        };

        v.extend( 'privacy_option', async function ( field, value, args ) {
            
            let allowedOptions = ['PUBLIC', 'PRIVATE'];
            if( allowedOptions.indexOf(value) >= 0 ) {
                return true;
            }
            return false;
        });

        v.extend( 'is_anonymous', async function ( field, value, args ) {
            
            let allowedOptions = ['YES', 'NO'];
            if( allowedOptions.indexOf(value) >= 0 ) {
                return true;
            }
            return false;
        });

        v.extend( 'post_upload_type', async function ( field, value, args ) {
            
            let allowedOptions = ['AUDIO', 'VIDEO', 'IMAGE', 'TEXT'];
            if( allowedOptions.indexOf(value) >= 0 ) {
                return true;
            }
            return false;
        });

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
                user_id: ObjectId( obj.user_id ),
                description: obj.description,
                privacy_option: obj.privacy_option,
                is_anonymous: obj.is_anonymous,
                post_upload_type: obj.post_upload_type
            };

            if( req.file != undefined && req.file.fieldname == 'post_upload_file' ) {

                body.post_upload_file = file.filename;
            } 
    
            let post = new PostModel( body );
            let savedPost = await post.save();
            var fullUrl = postFullProfilePath + savedPost.post_upload_file;
            savedPost.post_upload_file = fullUrl;
            
            return {
                status: 200,
                message: "post added successfully!",
                data: savedPost
            }
        }
    } catch( ex ) {

        return {
            status: 400,
            message: ex.toString(),
            message: null
        };
    }
}

let updatePost = async ( req ) => {

    try {
        
        let post_id = ObjectId( req.params.post_id );
        const post = await PostModel.findById( post_id );
        if( post ) {

            let body = {};
            let obj = req.body;
            let file = req.file;

            'user_id'                  in obj ? body.user_id = ObjectId( obj.user_id ) : body.user_id = ObjectId( post.user_id );
            'description'              in obj ? body.description = obj.description : body.description = post.description;
            'privacy_option'           in obj ? body.privacy_option = obj.privacy_option : body.privacy_option = post.privacy_option;
            'is_anonymous'             in obj ? body.is_anonymous = obj.is_anonymous : body.is_anonymous = post.is_anonymous;
            'post_upload_type'         in obj ? body.post_upload_type = obj.post_upload_type : body.post_upload_type = post.post_upload_type;

            if( req.file != undefined && req.file.fieldname == 'post_upload_file' ) {

                let filePath = postProfilePath + '/' + post.post_upload_file;
                fs.unlink( filePath, (err) => {
                    console.log( `${filePath} was deleted` );
                });
                body.post_upload_file = file.filename;
            } 

            let updatedPost = await PostModel.updateOne( { _id: post_id }, body);
            if( updatedPost ) {

                const out_data = await PostModel.findById( post_id );
                var fullUrl = postFullProfilePath + out_data.post_upload_file;
                out_data.post_upload_file = fullUrl;
                if( !out_data ) {

                    return {
                        status: 400,
                        message: "unable to get post!",
                        data: out_data
                    };
                } else {
                    
                    return {
                        status: 200,
                        message: "post has been updated successfully!",
                        data: out_data,
                        updatedRecordsCount: updatedPost.n
                    };
                }
            } else {

                return {
                    status: 400,
                    message: "unable to update post!",
                    data: null
                };
            }
        } else {

            return {
                status: 204,
                message: "post does not exist",
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

let getPostById = async ( req ) => {

    try {
        
        let post_id = ObjectId( req.params.post_id );
        const post = await PostModel.findById( post_id );
        if( !post ) {

            return {
                status: 204,
                message: "post not found!",
                data: null,
                err: post
            };
        } else {
            
            var fullUrl = postFullProfilePath + post.post_upload_file;
            post.post_upload_file = fullUrl;
            return {
                status: 200,
                message: "post found successfully!",
                data: post
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

let getAllPosts = async ( req ) => {

    try {
        let user_id = req.query.user_id;
        const post = await PostModel.aggregate([
                    { 
                        $lookup: {
                           from: "users",
                           localField: "user_id",
                           foreignField: "_id",
                           as: "users",
                        }
                    },

                    {
                        $unwind: "$users"
                    },

                    {
                        $lookup: {
                           from: "community_post_likes",
                           localField: "_id",
                           foreignField: "post_id",
                           as: "community_post_likes",
                        }
                    },

                    {
                        $project: {
                          "_id": 1,
                          "privacy_option": 1,
                          "is_anonymous":1,
                          "post_upload_type":1,
                          "created_at":1,
                          "updated_at":1,
                          "status":1,
                          "user_id":1,
                          "description":1,
                          "post_upload_file":1,
                          "username": {$concat: ['$users.first_name', ' ', '$users.last_name']},
                          "profile_image": {$concat: ['$users.profile_image']},
                          "post_upload_file": 1,
                          "like_type": '$community_post_likes.like_type', 
                          "like_user_id": '$community_post_likes.user_id',
                          "numOfLikes":{ $size:"$community_post_likes" }
                        }
                    }
                ]).sort({"_id": -1});
        if( !post ) {

            return {
                status: 204,
                message: "post not found!",
                data: null,
                err: post
            };
        } else {

           let arr = [];
           post.forEach( element => {

                let created_at = element.created_at;
                let time = created_at.getHours() +':'+ created_at.getMinutes();

                let isLiked = false;
                let liked_type = '';

                for( let i = 0; i < element.like_user_id.length; i++ ) {

                    if( element.like_user_id[i] == user_id ) {
                        isLiked = true;
                        liked_type = element.like_type[i];
                        break;
                    }
                }

               let row = {
                _id: element._id,
                privacy_option: element.privacy_option,
                is_anonymous: element.is_anonymous,
                post_upload_type: element.post_upload_type,
                created_at: element.created_at,
                time: time,
                // updated_at: element.updated_at,
                status: element.status,
                user_id: element.user_id,
                description: element.description,
                post_upload_file: element.post_upload_file,
                username: element.username,
                userimage: userFullProfilePath + element.profile_image,
                postfile: postFullProfilePath + element.post_upload_file,
                like_type_arr: element.like_type,
                like_user_id_arr: element.like_user_id,
                numOfLikes: element.numOfLikes,
                liked: isLiked,
                liked_type: liked_type
               }
               arr.push(row);
           }); 
            return {
                status: 200,
                message: "post found successfully!",
                data: arr
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

let deletePostById = async ( req ) => {

    try {

        let post_id = ObjectId( req.params.post_id );
        const post = await PostModel.findById( post_id );
        if( post ) {
            
            let filePath = postProfilePath + '/' + post.post_upload_file;
            fs.unlink( filePath, (err) => {
                // if (err) throw err;
                console.log( `${filePath} was deleted` );
            });

            let deletePost = await PostModel.deleteOne( { _id: post_id} );
            return {
                status: 200,
                message: "post deleted successfully!",
                data: deletePost
            };
        } else {

            return {
                status: 204,
                message: "post does not exist",
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

let isPostExists = async ( req ) => {

    try {

        let post_id = ObjectId( req.params.post_id );
        const post = await PostModel.count( {_id: post_id} );
        if( post ) {

            return {
                status: 200,
                message: "post id exists!",
                data: {
                    exists: post
                }
            };
        } else {

            return {
                status: 204,
                message: "post id does not exist",
                data: {
                    exists: post
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

let isUserLikedPostAlready = async ( req ) => {

    try {

        let post_id = ObjectId( req.body.post_id );
        let user_id = ObjectId( req.body.user_id );

        const post = await PostLikesModel.findOne({
            user_id: user_id,
            post_id: post_id
        });
        if( !post ) {

            return {
                status: 204,
                message: "post not liked yet by user!",
                data: {
                    exists: 0
                },
                err: post
            };
        } else {

            return {
                status: 200,
                message: "post already liked!",
                data: {
                    exists: 1
                }
            };
        }
    } catch( ex ) {

        return {
            status: 400,
            message: ex.toString(),
            data: {
                exist: 'exception'
            }
        };
    }
}

let insertUserPostLikes = async ( req ) => {

    try {

        let obj = req.body;
        
        /** VALIDATIONS CONFIG STARTS HERE */
        let required = {
            post_id: 'required',
            user_id: 'required',
            like_type: 'required'
        };

        v.extend( 'like_type', async function ( field, value, args ) {
            
            let allowedOptions = ['HAHA', 'WOW', 'LIKE', 'HEART', 'SAD', 'ANGRY', 'UNLIKE'];
            if( allowedOptions.indexOf(value) >= 0 ) {
                return true;
            }
            return false;
        });

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

            let like_type = req.body.like_type;
            let post_id = ObjectId( req.body.post_id );
            let user_id = ObjectId( req.body.user_id );
            
            if( like_type != 'UNLIKE' ) {
                
                let body = {
                    post_id: post_id,
                    user_id: user_id,
                    like_type: like_type
                };
        
                let like = new PostLikesModel( body );
                let savedLike = await like.save();
                
                return {
                    status: 200,
                    message: "post liked successfully!",
                    data: savedLike
                }        
            } else {

                let deletePost = await PostLikesModel.deleteOne( { post_id: post_id, user_id: user_id} );
                return {
                    status: 200,
                    message: "post unlike successfull!",
                    data: deletePost
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

let updateUserPostLikes = async ( req ) => {

    try {

        let obj = req.body;
        
        /** VALIDATIONS CONFIG STARTS HERE */
        let required = {
            post_id: 'required',
            user_id: 'required',
            like_type: 'required'
        };

        v.extend( 'like_type', async function ( field, value, args ) {
            
            let allowedOptions = ['HAHA', 'WOW', 'LIKE', 'HEART', 'SAD', 'UNLIKE'];
            if( allowedOptions.indexOf(value) >= 0 ) {
                return true;
            }
            return false;
        });

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

            let post_id = ObjectId( req.body.post_id );
            let user_id = ObjectId( req.body.user_id );
            let like_type = req.body.like_type;

            let body = {
                post_id: post_id,
                user_id: user_id,
                like_type: req.body.like_type            
            };

            if( like_type != 'UNLIKE' ) {

                let updatedlike = await PostLikesModel.update( { post_id: post_id, user_id: user_id }, body);
                if( updatedlike ) {

                    const out_data = await PostLikesModel.findOne({
                        user_id: user_id,
                        post_id: post_id
                    });
                    if( !out_data ) {

                        return {
                            status: 400,
                            message: "unable to update like!",
                            data: out_data
                        };
                    } else {
                        
                        return {
                            status: 200,
                            message: "post liked successfully!",
                            data: out_data,
                            updatedRecordsCount: updatedlike.n
                        };
                    }
                } else {

                    return {
                        status: 400,
                        message: "unable to update post like!",
                        data: null
                    };
                }   
            } else {

                let deletePost = await PostLikesModel.deleteOne( { post_id: post_id, user_id: user_id} );
                return {
                    status: 200,
                    message: "post unlike successfull!",
                    data: deletePost
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

let modifyPostAnonymousStatus = async ( req ) => {

    try {

        let user_id = ObjectId( req.params.user_id );
        let is_anonymous = req.body.is_anonymous;
        let body = {
            $set: {
                is_anonymous: is_anonymous
            }
        };

        let updatedPost = await PostModel.update( { user_id }, body, { multi: true } );
        return {
            status: 200,
            message: "post liked successfully!",
            data: updatedPost
        }        
    } catch( ex ) {

        return {
            status: 400,
            message: ex.toString(),
            data: null
        };
    }
}

let getPostsLikedByUserId = async ( req ) => {
    
    try {
        
        let user_id = ObjectId( req.query.user_id );
        const post = await PostLikesModel.aggregate([
            {
                $match: {
                    'user_id': user_id
                }
            },
            { 
                $lookup: {
                   from: "community_posts",
                   localField: "post_id",
                   foreignField: "_id",
                   as: "community_posts",
                }
            },

            {
                $unwind: "$community_posts"
            },

            { 
                $lookup: {
                   from: "users",
                   localField: "user_id",
                   foreignField: "_id",
                   as: "users",
                }
            },

            {
                $unwind: "$users"
            },

            {
                $project: {
                    "_id": 1,
                    "post_id": 1,
                    "user_id": 1,
                    "like_type": 1,
                    "created_at":1,
                    "updated_at":1,
                    "status":1,
                    "status":1,

                    "privacy_option": "$community_posts.privacy_option",
                    "is_anonymous": "$community_posts.is_anonymous",
                    "post_upload_type": "$community_posts.post_upload_type",
                    "post_created_by_user_id": "$community_posts.user_id",
                    "description": "$community_posts.description",
                    "post_upload_file": "$community_posts.post_upload_file",
                    
                    "first_name": "$users.first_name",
                    "last_name": "$users.last_name",
                    "user_profile_image": "$users.profile_image"
                }
            }
        ]);

        if( !post ) {
            
            return {
                status: 204,
                message: "user do not liked any post yet!",
                data: null,
                err: post
            };
        } else {

            return {
                status: 200,
                message: "user found successfully!",
                data: post,
                userProfilePath: userFullProfilePath,
                postProfilePath: postFullProfilePath
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
    insertPost: insertPost,
    updatePost: updatePost,
    getPostById: getPostById,
    getAllPosts: getAllPosts,
    deletePostById: deletePostById,
    isPostExists: isPostExists,
    isUserLikedPostAlready: isUserLikedPostAlready,
    insertUserPostLikes: insertUserPostLikes,
    updateUserPostLikes: updateUserPostLikes,
    modifyPostAnonymousStatus: modifyPostAnonymousStatus,
    getPostsLikedByUserId: getPostsLikedByUserId
};