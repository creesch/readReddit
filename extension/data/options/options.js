'use strict';
(function () {
    const currentSettings = {};
    chrome.storage.local.get(['fontFamily', 'fontSize', 'textWidth', 'lineHeight', 'colorMode', 'textAlign', 'collectInlineLinks', 'openRedditLinksInOverlay'], result => {
        currentSettings.colorMode = result.colorMode || utils.defaultSettings.colorMode;
        $('#rd-colorMode').val(currentSettings.colorMode);

        currentSettings.collectInlineLinks = result.collectInlineLinks === undefined ? utils.defaultSettings.collectInlineLinks : result.collectInlineLinks;
        $('#rd-collectInlineLinks').prop('checked', currentSettings.collectInlineLinks);

        currentSettings.openRedditLinksInOverlay = result.openRedditLinksInOverlay === undefined ? utils.defaultSettings.openRedditLinksInOverlay : result.openRedditLinksInOverlay;
        $('#rd-openRedditLinksInOverlay').prop('checked', currentSettings.openRedditLinksInOverlay);

        currentSettings.fontFamily = result.fontFamily || utils.defaultSettings.fontFamily;
        $('#rd-fontFamily').val(currentSettings.fontFamily);

        currentSettings.fontSize = result.fontSize || utils.defaultSettings.fontSize;
        $('#rd-fontSize').val(currentSettings.fontSize);

        currentSettings.textWidth = result.textWidth || utils.defaultSettings.textWidth;
        $('#rd-textWidth').val(currentSettings.textWidth);

        currentSettings.lineHeight = result.lineHeight || utils.defaultSettings.lineHeight;
        $('#rd-lineHeight').val(currentSettings.lineHeight);

        currentSettings.textAlign = result.textAlign || utils.defaultSettings.textAlign;
        $('#rd-textAlign').val(currentSettings.textAlign);
    });

    $('#rd-save').on('click', () => {
        currentSettings.colorMode = $('#rd-colorMode').val() || utils.defaultSettings.colorMode;

        currentSettings.collectInlineLinks = $('#rd-collectInlineLinks').prop('checked');

        currentSettings.openRedditLinksInOverlay = $('#rd-openRedditLinksInOverlay').prop('checked');

        currentSettings.fontFamily = $('#rd-fontFamily').val() || utils.defaultSettings.fontFamily;

        currentSettings.fontSize = $('#rd-fontSize').val() || utils.defaultSettings.fontSize;

        currentSettings.textWidth = $('#rd-textWidth').val() || utils.defaultSettings.textWidth;

        currentSettings.lineHeight = $('#rd-lineHeight').val() || utils.defaultSettings.lineHeight;

        currentSettings.textAlign = $('#rd-textAlign').val() || utils.defaultSettings.textAlign;

        chrome.storage.local.set(currentSettings, () => {
            UI.feedbackText('settings saved', UI.FEEDBACK_POSITIVE);
        });
    });
})();
