(function() {

    const currentSettings = {};
    chrome.storage.local.get(['fontFamily', 'fontSize', 'textWidth', 'colorScheme'], function(result) {

        currentSettings.fontFamily = result.fontFamily || defaultSettings.fontFamily;
        $('#rd-fontFamily').val(currentSettings.fontFamily);

        currentSettings.fontSize = result.fontSize || defaultSettings.fontSize;
        $('#rd-fontSize').val(currentSettings.fontSize);

        currentSettings.textWidth = result.textWidth || defaultSettings.textWidth;
        $('#rd-textWidth').val(currentSettings.textWidth);

    });

    $('#rd-save').on('click', () => {
        currentSettings.fontFamily = $('#rd-fontFamily').val() || defaultSettings.fontFamily;

        currentSettings.fontSize = $('#rd-fontSize').val() || defaultSettings.fontSize;

        currentSettings.textWidth = $('#rd-textWidth').val() || defaultSettings.textWidth;

        chrome.storage.local.set(currentSettings, () => {

            feedbackWindow('settings saved', 'positive');
        });
    });
})();