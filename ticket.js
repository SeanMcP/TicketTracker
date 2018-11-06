var newInput = document.getElementById('new_input');
var newButton = document.getElementById('new_button');
var ticketsList = document.getElementById('tickets_list');

var daysInOrder = ['M', 'T', 'W', 'R', 'F'];

function cloneObj(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function getClassFromNumber(number) {
    if (number === 0) {
        return 'zero';
    }
    if (number === 0.5) {
        return 'half';
    }
    if (number === 1) {
        return 'full';
    }
}

function addTicket() {
    if (newInput.value) {
        chrome.storage.sync.get(['tickets', 'days'], function(result) {
            var tickets = result.tickets.slice(0);
            var date = new Date();
            var id = date.getTime();
            var newTicket = {
                id: date.getTime(),
                name: newInput.value
            }
            tickets.push(newTicket)

            var days = cloneObj(result.days);
            daysInOrder.forEach(function(day) {
                if (!days[id]) {
                    days[id] = {};
                }
                days[id][day] = 0;
            });

            chrome.storage.sync.set({
                tickets: tickets,
                days: days
            }, function() {
                newInput.value = '';
                renderTickets();
            });
        });
    }
}

function removeTicket(id) {
    chrome.storage.sync.get(['tickets', 'days'], function(result) {
        var tickets = result.tickets.filter(function(ticket) {
            return ticket.id !== id;
        });

        var days = cloneObj(result.days);
        delete days[id];

        chrome.storage.sync.set({
            tickets: tickets,
            days: days
        }, function() {
            renderTickets();
        });
    });
}

function trackTicket(id, day) {
    chrome.storage.sync.get('days', function(result) {
        var days = cloneObj(result.days);
        days[id][day] += 0.5;
        if (days[id][day] > 1) {
            days[id][day] = 0;
        }

        chrome.storage.sync.set({
            days: days
        }, function() {
            renderTickets(id);
        });
    });
}

function renderTickets(id) {
    while (ticketsList.firstChild) {
        ticketsList.removeChild(ticketsList.firstChild);
    }
    chrome.storage.sync.get(['tickets', 'days'], function(result) {
        if (result.tickets.length) {
            result.tickets.forEach(function(ticket) {
                var item = document.createElement('li');
                var details = document.createElement('details');
                if (id === ticket.id) {
                    details.open = true;
                }
                var summary = document.createElement('summary');
                summary.textContent = ticket.name;
                details.appendChild(summary);

                var daysList = document.createElement('ul');
                daysList.id = 'days_list';
                var days = result.days[ticket.id];
                daysInOrder.forEach(function(day) {
                    var dayItem = document.createElement('li');
                    var dayButton = document.createElement('button');
                    dayButton.type = 'button';
                    dayButton.classList.add('day-button', getClassFromNumber(days[day]));
                    dayButton.textContent = day;
                    dayButton.addEventListener('click', function() {
                        trackTicket(ticket.id, day);
                    });

                    dayItem.appendChild(dayButton);
                    daysList.appendChild(dayItem);
                });
                details.appendChild(daysList);
    
                var deleteButton = document.createElement('button');
                deleteButton.type = 'button';
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', function() {
                    removeTicket(ticket.id);
                });
                details.appendChild(deleteButton);

                item.appendChild(details);
                ticketsList.appendChild(item);
            })
        } else {
            var noneFound = document.createElement('li');
            noneFound.id = "none_found";
            noneFound.textContent = "**crickets**";
            ticketsList.appendChild(noneFound);
        }
    });
}

newButton.addEventListener('click', addTicket);
renderTickets();