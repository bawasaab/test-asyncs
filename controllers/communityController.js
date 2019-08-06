const ObjectId = require('mongodb').ObjectID;
const communityService = require('../services').communityService;

let insertPost = async ( req, res ) => {
    
    try {

        let result = await communityService.insertPost( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let updatePost = async ( req, res ) => {
    
    try {
        
        let result = await communityService.updatePost( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let getPostById = async ( req, res ) => {
    
    try {
        
        const result = await communityService.getPostById( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let getAllPosts = async ( req, res ) => {
    
    try {
        
        const result = await communityService.getAllPosts( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let deletePostById = async ( req, res ) => {
    
    try {
        
        const result = await communityService.deletePostById( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let isPostExists = async ( req, res ) => {

    try {
        
        const result = await communityService.isPostExists( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let insertUserPostLikes = async ( req, res ) => {

    try {

        let is_exists = await communityService.isUserLikedPostAlready( req );
        if( is_exists.status == 400 ) {

            res.send({
                status: 400,
                message: is_exists.message,
                data: null
            });
        } else if( is_exists.data.exists ) {
            
            const result = await communityService.updateUserPostLikes( req );
            res.send( result );
        } else {

            const result = await communityService.insertUserPostLikes( req );
            res.send( result );
        }
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let modifyPostAnonymousStatus = async ( req, res ) => {

    try {
        
        const result = await communityService.modifyPostAnonymousStatus( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

let getPostsLikedByUserId = async ( req, res ) => {
    
    try {
        
        const result = await communityService.getPostsLikedByUserId( req );
        res.send( result );
    } catch( err ) {

        res.send({
            status: 400,
            message: err.toString(),
            data: null
        });
    }
}

module.exports = {
    insertPost: insertPost,
    updatePost: updatePost,
    getPostById: getPostById,
    getAllPosts: getAllPosts,
    deletePostById: deletePostById,
    isPostExists: isPostExists,
    insertUserPostLikes: insertUserPostLikes,
    modifyPostAnonymousStatus: modifyPostAnonymousStatus,
    getPostsLikedByUserId: getPostsLikedByUserId
};