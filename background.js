chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({
        days: {},
        tickets: []
    }, function () {
        console.log("The color is green.");
    });
});