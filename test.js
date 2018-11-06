// var count = 0;
function setCount(count) {
    var output = document.querySelector('h1');

    if (count) {
        return output.textContent = count;
    }
    chrome.storage.sync.get('count', function(result) {    
        output.textContent = result.count
    });
}
function increment() {
    chrome.storage.sync.get('count', function(result) {
        var newCount = result.count + 1;
        chrome.storage.sync.set({
            count: newCount
        }, function() {
            setCount(newCount);
        });
    });
}
document.getElementById('increment').addEventListener('click', increment);
setCount();