chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({
        expandAll: false,
        daysById: {},
        tickets: []
    });
});