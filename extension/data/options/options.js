'use strict';
(function () {
    const currentSettings = {};
    chrome.storage.local.get(['fontFamily', 'fontSize', 'textWidth', 'lineHeight', 'colorMode', 'textAlign'], result => {
        currentSettings.colorMode = result.colorMode || utils.defaultSettings.colorMode;
        $('#rd-colorMode').val(currentSettings.colorMode);

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
