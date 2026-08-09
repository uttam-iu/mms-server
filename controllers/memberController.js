
const { v4: uuid } = require('uuid');
const members = require('../dummyData/users.json');
const { getHassPassword, isPasswordMatch, getResponseTemplate, serverFormattedDateAndTime } = require('../helpers/utilities');
var jwt = require('jsonwebtoken');

exports.members = async (req, res) => {    
    return getResponseTemplate(res, 200,members, "success.");
};