
const parametrify = (url, paramValues) => {
    // Inject parameter values to url-path.
    return url.replace(/(?<=\/:)[^\/]+/g, (param) => paramValues[param]);
};

module.exports = {parametrify};