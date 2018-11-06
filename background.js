chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({
        count: 0,
        tickets: []
    }, function () {
        console.log("The color is green.");
    });
});