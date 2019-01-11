/** @namespace  utils */
(function (utils) {

    utils.mdRegex = /<div class="md">([\s\S]*?)<\/div>/m;
    utils.defaultSettings = {
        fontFamily: 'Verdana,Geneva,sans-serif',
        fontSize: '16px',
        textWidth: '45em',
        colorMode: 'light'
    };

    utils.currentSettings = {};

    utils.commentChainDigger = function(commentArray, authorName, callback) {
        chrome.runtime.sendMessage({
            action: 'commentChainDigger',
            details: {
                commentArray: commentArray,
                authorName: authorName
            }
        }, function(response) {
            return callback(response.comments);

        });
    };

    utils.commentSection = function(commentArray, callback) {
        chrome.runtime.sendMessage({
            action: 'commentSection',
            details: {
                commentArray: commentArray
            }
        }, function(response) {
            return callback(response.comments);
        });
    };
}(utils = window.utils || {}));
