var newInput = document.getElementById('new_input');
var newButton = document.getElementById('new_button');
var ticketsList = document.getElementById('tickets_list');
var settingsToggle = document.getElementById('settings_toggle');
var deleteAll = document.getElementById('delete_all');
var expandToggle = document.getElementById('expand_toggle');

var defaultOpen = false;
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
    var previouslyOpen = findOpenDetails();
    while (ticketsList.firstChild) {
        ticketsList.removeChild(ticketsList.firstChild);
    }
    chrome.storage.sync.get(['tickets', 'days'], function(result) {
        if (result.tickets.length) {
            result.tickets.forEach(function(ticket) {
                var item = document.createElement('li');
                var details = document.createElement('details');
                if (id === ticket.id || previouslyOpen.includes(ticket.id) || defaultOpen) {
                    details.open = true;
                }
                details.dataset.id = ticket.id;
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

                var time = document.createElement('div');
                time.classList.add('time');
                var now = new Date().getTime();
                var diff = Math.round((ticket.id - now) / 86400000);
                time.textContent = `Added ${Math.abs(diff)} days ago`;
                details.appendChild(time);

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

function toggleSettings() {
    var settings = document.getElementById('settings');
    if (settings.classList.contains('hide')) {
        settings.removeAttribute('class');
        settingsToggle.classList.add('open');
    } else {
        settings.classList.add('hide');
        settingsToggle.removeAttribute('class');
    }
}

function removeAll() {
    chrome.storage.sync.set({
        days: {},
        tickets: {}
    }, function() {
        renderTickets();
    });
}

function toggleDefaultOpen(e) {
    defaultOpen = e.target.checked;
    renderTickets();
}

function findOpenDetails() {
    var open = [];
    document.querySelectorAll('details[open]').forEach(function(item) {
        open.push(Number(item.dataset.id));
    });
    return open;
}

renderTickets();
newButton.addEventListener('click', addTicket);
settingsToggle.addEventListener('click', toggleSettings);
expandToggle.addEventListener('click', toggleDefaultOpen);
deleteAll.addEventListener('click', removeAll);