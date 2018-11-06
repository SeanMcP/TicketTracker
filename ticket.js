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

function removeTicket(id) {
    chrome.storage.sync.get('tickets', function(result) {
        var list = result.tickets.filter(function(ticket) {
            return ticket.id !== id;
        });

        chrome.storage.sync.set({
            tickets: list
        }, function() {
            renderTickets();
        });
    });
}

function renderTickets() {
    while (ticketsList.firstChild) {
        ticketsList.removeChild(ticketsList.firstChild);
    }
    chrome.storage.sync.get('tickets', function(result) {
        if (result.tickets.length) {
            result.tickets.forEach(function(ticket) {
                var item = document.createElement('li');
                var heading = document.createElement('h1');
                heading.textContent = ticket.name;
                item.appendChild(heading);
    
                var deleteButton = document.createElement('button');
                deleteButton.type = 'button';
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', function() {
                    removeTicket(ticket.id);
                });
                item.appendChild(deleteButton);
    
                ticketsList.appendChild(item);
            })
        } else {
            var noneFound = document.createElement('li');
            noneFound.id = "none_found";
            noneFound.textContent = "Add a ticket below";
            ticketsList.appendChild(noneFound);
        }
    });
}

newButton.addEventListener('click', addTicket);
renderTickets();