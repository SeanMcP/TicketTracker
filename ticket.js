var newInput = document.getElementById('new_input');
var newButton = document.getElementById('new_button');

function addTicket() {
    chrome.storage.sync.get('tickets', function(result) {
        var list = result.tickets.slice(0);
        var newTicket = {
            id: new Date().getTime,
            name: newInput.value
        }
        list.push(newTicket)
        chrome.storage.sync.set({
            ticket: list
        }, function() {
            alert('Success!');
            newInput.value = '';
            // setCount(newCount);
        });
    });
}

newButton.addEventListener('click', addTicket);