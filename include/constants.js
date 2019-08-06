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
        accountSid: 'xxxxxxxxxxxxxxxxxx',
        authToken: 'xxxxxxxxxxxxxxxxxx'
    }
};
