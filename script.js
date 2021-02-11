const server = "https://PartyChats-server-1.zachariahjudd.repl.co";

function xhrSuccess() { 
    this.callback.apply(this, this.arguments); 
}
function xhrError() { 
    console.error(this.statusText); 
}
function loadFile(route, callback, data, method /*, opt_arg1, opt_arg2, ... */) {
    var xhr = new XMLHttpRequest();
    xhr.callback = callback;
    xhr.arguments = Array.prototype.slice.call(arguments, 2);
    xhr.onload = xhrSuccess;
    xhr.onerror = xhrError;
    xhr.open(method, `${server}${route}`, true);
    xhr.send(data);
}
function showMessage(message) {
    var response = JSON.parse(this.responseText)['response'];
    if (response[0] === false) {
        alert(response[1])
    }
}

function check() {
    // if no password or room name
    if (sessionStorage.getItem("password") == null || sessionStorage.getItem('room') == null) {
        window.location.href = 'https://rhs-swcr.zachariahjudd.repl.co/home/';
    }

    // enter name
    if (sessionStorage.getItem("name") == null || sessionStorage.getItem("name") === '') {
        var text = "Please enter your name:";
        var name = '';

        if (sessionStorage.getItem('placeholder') !== 'null') {
            var placeholder = sessionStorage.getItem('placeholder');
        }
        else {
            var placeholder = `guest${Math.floor(Math.random() * 10000)}`;
        }
        
        while (name == null || name == "" || name.includes('@') || name.includes('<') || name.includes('>')) {
            name = prompt(text, placeholder);
            if (name == null || name == "") {
                text = 'name cannot be empty. Please enter your name:';
            }
            else if (name.includes('@') || name.includes('<') || name.includes('>')) {
                text = 'name cannot contain invalid character(s): ["@", "<", ">"]. Please enter your name:';
            }
        }
        sessionStorage.setItem('placeholder', name);
        sessionStorage.setItem('name', name);
    }
}

function clearStorage() {
    placeholder = sessionStorage.getItem('placeholder');
    sessionStorage.clear();
    sessionStorage.setItem('placeholder', placeholder);
}

// sets attributes for all inputs
const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
    input.setAttribute('autocomplete', 'off')
    input.setAttribute('autocorrect', 'on')
    input.setAttribute('spellcheck', true)
})