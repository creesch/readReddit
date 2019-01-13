(function() {

    const currentSettings = {};
    chrome.storage.local.get(['fontFamily', 'fontSize', 'textWidth', 'lineHeight', 'colorScheme'], function(result) {

        currentSettings.fontFamily = result.fontFamily || utils.defaultSettings.fontFamily;
        $('#rd-fontFamily').val(currentSettings.fontFamily);

        currentSettings.fontSize = result.fontSize || utils.defaultSettings.fontSize;
        $('#rd-fontSize').val(currentSettings.fontSize);

        currentSettings.textWidth = result.textWidth || utils.defaultSettings.textWidth;
        $('#rd-textWidth').val(currentSettings.textWidth);

        currentSettings.lineHeight = result.lineHeight || utils.defaultSettings.lineHeight;
        $('#rd-lineHeight').val(currentSettings.lineHeight);

    });

    $('#rd-save').on('click', () => {
        currentSettings.fontFamily = $('#rd-fontFamily').val() || utils.defaultSettings.fontFamily;

        currentSettings.fontSize = $('#rd-fontSize').val() || utils.defaultSettings.fontSize;

        currentSettings.textWidth = $('#rd-textWidth').val() || utils.defaultSettings.textWidth;

        currentSettings.lineHeight = $('#rd-lineHeight').val() || utils.defaultSettings.lineHeight;

        chrome.storage.local.set(currentSettings, () => {

            UI.feedbackText('settings saved', UI.FEEDBACK_POSITIVE);
        });
    });
})();
