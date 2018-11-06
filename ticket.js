var newInput = document.getElementById('new_input');
var newButton = document.getElementById('new_button');
var ticketsList = document.getElementById('tickets_list');

function addTicket() {
    if (newInput.value) {
        chrome.storage.sync.get('tickets', function(result) {
            var list = result.tickets.slice(0);
            var date = new Date();
            var newTicket = {
                id: date.getTime(),
                name: newInput.value
            }
            list.push(newTicket)

            chrome.storage.sync.set({
                tickets: list
            }, function() {
                newInput.value = '';
                renderTickets();
            });
        });
    }
}

function renderTickets() {
    while (ticketsList.firstChild) {
        ticketsList.removeChild(ticketsList.firstChild);
    }
    chrome.storage.sync.get('tickets', function(result) {
        result.tickets.forEach(function(ticket) {
            var item = document.createElement('li');
            item.textContent = ticket.name;
            ticketsList.appendChild(item);
        })
    });
}

newButton.addEventListener('click', addTicket);
renderTickets();