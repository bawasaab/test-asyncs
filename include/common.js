exports.isEmpty = async function( required, obj ) {
    
    let err = [];
    for( let key in obj ) {

        if( required.indexOf( key ) > -1 ) {

            if( obj[key] == "" ) {
                err.push({
                    [key] : `The field ${key} must not be kept empty!`
                });
            }
        }
    }

    if ( err.length > 0 ) {

        return {
            err: true,
            res: {
                status: 400,
                message: "Invalid inputs!",
                data: err
            }
        };
    } else {

        return {
            err: false,
            res: {}
        };
    }
}

exports.errorHelper = async ( obj ) => {

    let msg = '';
    for( var prop in obj ) {
        msg = obj[prop].message;
        break;
    }
    return msg;
}