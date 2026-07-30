const bcrypt = require("bcrypt")
const saltRounds = 10;

const serverFormattedDateAndTime = (dateStr) => {
    if (!dateStr) return dateStr;

    let date;

    if (dateStr instanceof Date) date = dateStr;
    else date = new Date(dateStr);

    if (date.toString() === 'Invalid Date') return dateStr;

    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month < 10) month = `0${month}`;
    let day = date.getDate();
    if (day < 10) day = `0${day}`;

    let hours = date.getHours();
    if (hours < 10) hours = `0${hours}`;
    let minutes = date.getMinutes();
    if (minutes < 10) minutes = `0${minutes}`;
    let seconds = date.getSeconds();
    if (seconds < 10) seconds = `0${seconds}`;

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const serverFormattedDate = (dateStr) => {
    if (!dateStr) return dateStr;

    let date;

    if (dateStr instanceof Date) date = dateStr;
    else date = new Date(dateStr);

    if (date.toString() === 'Invalid Date') return dateStr;

    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month < 10) month = `0${month}`;
    let day = date.getDate();
    if (day < 10) day = `0${day}`;

    return `${year}-${month}-${day}`;
};

const getHassPassword = (text, cb) => {
    const plainText = text?.toString() 
    bcrypt.hash(plainText, saltRounds, function (err, hash) {
        cb(hash);
    });
}

const isPasswordMatch = (plainText, hash, cb) => {
    bcrypt.compare(plainText, hash, function (err, result) {
        // result == true
        cb(result);
    });
}

const getResponseTemplate = (res, statusCode=200, data=null, message="")=> {
    const isSuccess = statusCode>=200 && statusCode <300;
    // const msg = message || statusCode>=200 && statusCode <300 ? 'Success' : 'Failed';
    return res.status(statusCode).json({
		success: isSuccess,
        status: statusCode,
		message: message,
        data,
        isError: !isSuccess,
	});
}

module.exports = {
    serverFormattedDate: serverFormattedDate,
    serverFormattedDateAndTime: serverFormattedDateAndTime,
    getHassPassword: getHassPassword,
    isPasswordMatch: isPasswordMatch,
    getResponseTemplate:getResponseTemplate
}