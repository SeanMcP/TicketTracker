chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({
        daysById: {},
        tickets: []
    });
});