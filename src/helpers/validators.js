const isType = (value, type) => typeof(value) === type;

const isString = (value) => isType(value, "string");

const isObject = (value) => isType(value, "object");

const fieldRequired = (val) => val ? true : "This field is required!";

module.exports = {isType, isString, isObject, fieldRequired};