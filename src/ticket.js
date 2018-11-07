var newInput = document.getElementById('new_input');
var newButton = document.getElementById('new_button');
var ticketsList = document.getElementById('tickets_list');
var settingsToggle = document.getElementById('settings_toggle');
var deleteAll = document.getElementById('delete_all');
var expandToggle = document.getElementById('expand_toggle');

var daysInOrder = ['M', 'T', 'W', 'R', 'F'];

chrome.storage.sync.get('expandAll', function(result) {
    expandToggle.checked = result.expandAll;
});

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
        chrome.storage.sync.get(['tickets', 'daysById'], function(result) {
            var tickets = result.tickets.slice(0);
            var id = new Date().getTime();
            var newTicket = {
                id: id,
                name: newInput.value
            }
            tickets.push(newTicket)

            var days = cloneObj(result.daysById);
            daysInOrder.forEach(function(day) {
                if (!days[id]) {
                    days[id] = {};
                }
                days[id][day] = 0;
            });

            chrome.storage.sync.set({
                tickets: tickets,
                daysById: days
            }, function() {
                newInput.value = '';
                renderTickets();
            });
        });
    }
}

function removeTicket(id) {
    chrome.storage.sync.get(['tickets', 'daysById'], function(result) {
        var tickets = result.tickets.filter(function(ticket) {
            return ticket.id !== id;
        });

        var days = cloneObj(result.daysById);
        delete days[id];

        chrome.storage.sync.set({
            tickets: tickets,
            daysById: days
        }, function() {
            renderTickets();
        });
    });
}

function trackTicket(id, day) {
    chrome.storage.sync.get('daysById', function(result) {
        var days = cloneObj(result.daysById);
        days[id][day] += 0.5;
        if (days[id][day] > 1) {
            days[id][day] = 0;
        }

        chrome.storage.sync.set({
            daysById: days
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
    chrome.storage.sync.get(['tickets', 'daysById', 'expandAll'], function(result) {
        if (result.tickets.length) {
            result.tickets.forEach(function(ticket) {
                var item = document.createElement('li');
                var details = document.createElement('details');
                if (id === ticket.id || previouslyOpen.includes(ticket.id) || result.expandAll) {
                    details.open = true;
                }
                details.dataset.id = ticket.id;
                var summary = document.createElement('summary');
                summary.textContent = ticket.name;
                details.appendChild(summary);

                var daysList = document.createElement('ul');
                daysList.id = 'days_list';
                var days = result.daysById[ticket.id];
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

                var info = document.createElement('section');
                info.classList.add('info');

                var time = document.createElement('span');
                time.classList.add('time');
                var diff = Math.abs(
                    Math.round(
                        (ticket.id - new Date().getTime()) / 86400000
                    )
                );
                time.textContent = `Added ${diff > 0 ? `${diff} day${diff > 1 ? 's' : ''} ago` : 'today'}`;
                info.appendChild(time);

                var deleteButton = createDeleteTicketButton(ticket.id);
                info.appendChild(deleteButton);

                details.appendChild(info);

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

// Creator functions

// General

function createElementWithClass(type, classes) {
    var el = document.createElement(type);
    if (classes) {
        if (classes.constructor === Array) {
            classes.forEach(function(cl) {
                el.classList.add(cl);
            });
        } else {
            el.classList.add(classes)
        }
    }
    return el;
}

function createButton(classes) {
    var button = createElementWithClass('button', classes);
    button.type = 'button';
    return button;
}

// Specific

function createDeleteTicketButton(ticketId) {
    var deleteButton = createButton('delete-button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function() {
        removeTicket(ticketId);
    });
    return deleteButton;
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
        daysById: {},
        tickets: {}
    }, function() {
        renderTickets();
    });
}

function toggleExpandAll(e) {
    chrome.storage.sync.set({
        expandAll: e.target.checked
    }, function() {
        renderTickets();
    });
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
expandToggle.addEventListener('click', toggleExpandAll);
deleteAll.addEventListener('click', removeAll);