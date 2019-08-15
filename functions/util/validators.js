const isEmpty = (string) => {
    if (string.trim() === ''){
        return true;
    }
    return false;
}

const isEmail = (email) => {
    //TODO get email regex
    return true;
}

exports.validateSignupData = (data) => {
    let errors = {};

    if (isEmpty(data.email)){
        errors.email = 'must not be empty';
    }
    else if (!isEmail(data.email)){
        errors.email = 'must be valid';
    }

    if (isEmpty(data.password)) errors.password = 'must not be empty';
    if (data.password !== data.confirmPassword) errors.confirmPassword = 'passwords must match';
    if (isEmpty(data.handle)) errors.handle = "must not be empty";

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validateLoginData = (user) => {
    let errors = {};
    if (isEmpty(user.email)) errors.email = 'must not be empty';
    if (isEmpty(user.password)) errors.password = "must not be empty";
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.reduceUserDetails = (data) => {
    let userDetails = {};
    if (!isEmpty(data.bio.trim())){
        userDetails.bio = data.bio;
    }
    if (!isEmpty(data.website.trim())){
        //https://website.com
        if (data.website.trim().substring(0, 4) !== 'http'){
            userDetails.website = `https://${data.website.trim()}`;
        }
        else {
            userDetails.website = data.website;
        }
    }
    if (!isEmpty(data.location.trim())) {
        userDetails.location = data.location;
    }
    return userDetails;
}