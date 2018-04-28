module.exports = function niceDate(date) {
    return date.toISOString().replace(/T.*/,'').split('-')
};