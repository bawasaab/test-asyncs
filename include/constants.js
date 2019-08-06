var http = require('http');
var url = require('url') ;

module.exports = {
    // baseUrl: 'np.seasiafinishingschool.com/igethappy/',
    baseUrl: 'http://localhost:3000',
    userProfilePath: 'public/uploads',
    userGetProfilePath: 'uploads',
    userFullProfilePath: 'http://localhost:3000/uploads/',
    JWT_SECRET: '242f274e9f3ac64cde7574c9452b7011',
    postProfilePath: 'public/uploads/community_posts',
    postGetProfilePath: 'uploads/community_posts',
    postFullProfilePath: 'http://localhost:3000/uploads/community_posts/',
    documentPath: 'public/uploads/documents',
    twillioCredentials: {
        accountSid: 'AC9eee1a3621c7d027645a72e3056c438e',
        authToken: 'c671a1a8258b8e11ae0a70f6121614a3'
    }
};