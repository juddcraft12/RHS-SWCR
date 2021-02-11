// set title to room name
document.title = sessionStorage.getItem("room");

function isColor(strColor){
    var s = new Option().style;
    s.color = strColor;

    if (s.color == strColor.toLowerCase()) {
        return true
    }
    return /^#[0-9A-F]{6}$/i.test(strColor);
}

// global json object for each user and their assigned color
usersColors = {};
commands = `COMMANDS:/n/n
/color
<div style="display: flex; margin-left: 10px;">EXAMPLE: "/‎color(red)
    <p style="margin: 0 0; word-wrap: break-word; color: red">hello world</p>"
</div>
/n
/‎n
<div style='margin-left: 10px;'>USE /‎n TO BREAK TO NEW LINE.</div>
/n`;
wait = true;
lastmessages = '';
dom = document.createElement('div');
firstIter = true;
lastDomLength = '';
function updateChat(response) {
    var req = JSON.parse(this.responseText);
    var data = req['response'][1];

    if (req['response'][0] === false) {
        sessionStorage.setItem("name", '');
        check();
        return '';
    }

    var data = JSON.parse(data)['data']

    // assigns a color to each users name
    for (i in data['users']) {
        if (!(data['users'][i] in usersColors)) {
            usersColors[data['users'][i]] = `${"#"+((1<<24)*Math.random()|0).toString(16)}`;
        }
    }

    var messages = '';

    var count = data['chat'].length;
    var lastUser = '';
    for (var i = 0; i < count; i++) {
        var message = data['chat'][i]

        var date = Object.keys(message);
        var user = message[date]['user'];
        var msg = message[date]['message'];
        
        // commands
        if (msg.includes('/commands')) {
            msg = commands;
        }
        if (msg.includes('/n')) {
            msg = msg.split("/n").join("<br>");
        }
        if (msg.includes('/color(') && msg.includes(')')) {
            var sub = msg.substring(msg.lastIndexOf("/color("), msg.lastIndexOf(")") + 1);
            var color = sub.substring(sub.lastIndexOf("(") + 1, sub.lastIndexOf(")"));
            if (isColor(color)) {
                msg = msg.replace(sub, '');
                msg = `<p style='margin: 0 0; word-wrap: break-word; width: 100%; float: left; color: ${color}'>` + msg + '</p>';
            }
        }
        if (msg.includes('[@') && msg.includes(']')) {
            var sub = msg.substring(msg.lastIndexOf("[@"), msg.lastIndexOf("]") + 1);

            var username = sub.substring(sub.lastIndexOf("@"), sub.lastIndexOf("]"));
            username = `<p style='display: inline;white-space: nowrap; margin: 0 0; word-wrap: break-word; float: left; color: blue; font-weight: 100'>` + username +'</p>';

            msg = msg.replace(sub, username);
        }
        // /commands
        
        // assigns a color to each users name
        if (!(user in usersColors)) {
            usersColors[user] = `${"#"+((1<<24)*Math.random()|0).toString(16)}`;
        }

        // add image if message has image
        var chatImg = '';
        if (message[date].hasOwnProperty('image')) {
            chatImg = `<div id='${message[date]['image']}' class='chatImage'></div>`;
        }

        // adds the message element for each messsage to messages
        if (user !== lastUser) {
            messages += `
            <div class='messageWrapper'>
            <div class='triangle'></div>
            <div class='msgContainer' onclick='replyTo("${user}")'>
                <h4 class='name' style='font-weight: 900; color: ${usersColors[user]}'>@${user}</h4>
                <h2 class='msg'>${msg}</h2>
                ${chatImg}
                <h4 class='date'>${date}</h4></div></div>`;
        }
        else {
            messages += `
            <div class='messageWrapper'>
            <div class='triangle' style='opacity: 0; margin-top: -5px;'></div>
            <div class='msgContainer' style='margin-top: -5px;' onclick='replyTo("${user}")'>
                <h2 class='msg'>${msg}</h2>
                ${chatImg}
                <h4 class='date'>${date}</h4></div></div>`;
        }

        lastUser = user;
    }

    var chatBox = document.getElementById('messages');
    
    dom.innerHTML = messages;
    
    if (wait) {
        wait = false;

        var messagesList = messages.split('</h4></div>');
        if (messagesList.toString() !== "" && dom.children.length !== chatBox.children.length) {
            if (firstIter) {
                chatBox.innerHTML = '';
                for (i in messagesList) {
                    chatBox.innerHTML += messagesList[i] + '</h4></div>';
                }

                for (var i = 0; i < chatBox.children.length; i++) {
                    chatBox.children[i].animate([
                        // keyframes
                        { transform: 'scale(0.6)' },
                        { transform: 'scale(0.7)' },
                        { transform: 'scale(0.8)' },
                        { transform: 'scale(1)' },
                        { transform: 'scale(1.04)' },
                        { transform: 'scale(1.07)' },
                        { transform: 'scale(1.1)' },
                        { transform: 'scale(1.05)' },
                        { transform: 'scale(1)' }
                        ], { 
                        // timing options
                        duration: 300,
                        iterations: 1});
                }

                firstIter = false;
            }
            else {
                if (Number.isInteger(lastDomLength)) {
                    var newlen = dom.children.length;
                    var newMessages = newlen - chatBox.children.length;
                    for (var i = 1; i < newMessages + 1; i++) {
                        chatBox.appendChild(dom.children[dom.children.length - 1])
                        chatBox.lastChild.animate([
                            // keyframes
                            { transform: 'scale(0.6)' },
                            { transform: 'scale(0.7)' },
                            { transform: 'scale(0.8)' },
                            { transform: 'scale(1)' },
                            { transform: 'scale(1.04)' },
                            { transform: 'scale(1.07)' },
                            { transform: 'scale(1.1)' },
                            { transform: 'scale(1.05)' },
                            { transform: 'scale(1)' }
                            ], { 
                            // timing options
                            duration: 300,
                            iterations: 1});
                    }
                    // increases notify count
                    notify(newMessages);
                }
            }
        
            // scroll to bottom of chat when new message is added
            var chatBoxContainer = document.getElementById('chatBox');
            chatBoxContainer.scrollTop = chatBoxContainer.scrollHeight;  

            var chatImages = document.getElementsByClassName('chatImage');
            for (var num = 0; num < chatImages.length; num++) {
                if (chatImages[num].style.backgroundImage === '') {
                    placeChatImage(chatImages[num].id);
                }
            }
        }
        wait = true;
    }

    lastDomLength = dom.children.length;

    var users = ''
    for (i in data['users']) {
        users += `<div  onclick='replyTo("${data['users'][i]}")' style='cursor:pointer; text-shadow: 0 0 2px black; ;padding: 2px 2px; display: flex; background-color: #505050; border-radius: 10px; margin: 5px;'><span class='fa fa-user' style='color: green'></span><p class='name' style='margin-left:2px; color: ${usersColors[data['users'][i]]}'>@` + data['users'][i] + '\n' + `</p></div>`
    }
    users += '<div style="margin-left: 100px"></div>'
    for (i in data['all_users']) {
        if (!(data['users'].includes(data['all_users'][i]))) {
            users += `<div  onclick='replyTo("${data['all_users'][i]}")' style='cursor:pointer; text-shadow: 0 0 2px black; ;padding: 2px 2px; display: flex; background-color: #505050; border-radius: 10px; margin: 5px;'><span class='fa fa-user' style='color: red'></span><p class='name' style='margin-left:2px; color: red'>@` + data['all_users'][i] + '\n' + `</p></div>`
        }
    }
    dom.innerHTML = users;
    //var userbox = document.getElementById("users");
    var userbox = document.getElementById('user');
    if (userbox.innerHTML.length !== dom.innerHTML.length) {
        userbox.innerHTML = users;
    }
}

function placeChatImage(imageUUID) {
    var request = new XMLHttpRequest();
    var url = `${server}/getchatimage/?imageUUID=${imageUUID}`;

    request.open('GET', url, true);  // `false` makes the request synchronous

    request.onload = function (e) {
        if (request.readyState === 4) {
            var type = request.getResponseHeader('content-type');
            if (type === 'application/json') {
                var msgImg = document.getElementById(`${imageUUID}`);
                msgImg.style.backgroundImage = 'url("chat_image_does_not_exist.png")';
            }
            if (type === 'image/png') {
                var msgImg = document.getElementById(`${imageUUID}`);
                msgImg.style.backgroundImage = `url("${url}")`;
            }
        }
    }
    request.send(null);
}

function sendMessage() {
    var room = 'global'
    var message = document.getElementById('message').value;

    if (message !== '') {
        var data = new FormData();
        data.append('room', sessionStorage.getItem("room"));
        data.append('user', sessionStorage.getItem("name"));
        data.append('password', sessionStorage.getItem("password"));
        data.append('message', message);
        data.append('image', imageAsFile);
        loadFile("/message", showMessage, data, 'POST');
        document.getElementById('message').value = '';
    }
    
    hideInfo();

    clearUploadedChatImage();

    // if emoji buttons are visible, hide them
    emojis = document.getElementById('emojis');
    if (emojis.classList.contains('showEmojis')) {
        emojis.classList.remove('showEmojis');
        emojis.classList.add('hide');
    }
}

function getChat() {
    var data = new FormData();
    data.append('room', sessionStorage.getItem("room"));
    data.append('user', sessionStorage.getItem("name"));
    data.append('password', sessionStorage.getItem("password"));
    loadFile("/getchat", updateChat, data, 'POST');
}

// will continously request the session info from server every delay milli-seconds
var delay = 500;
function update() {
    window.setTimeout(function() {
        getChat();
        update();
    }, delay);
}

function goHome() {
    window.location.href = 'https://rhs-swcr.zachariahjudd.repl.co/home';
}

function hideInfo() {
    var info = document.getElementById('info');
    if (!(info.classList.contains('hideInfo'))) {
        info.classList.add('hideInfo');
        setTimeout( function() {
            info.style.display = 'none';
        }, 1200);
    }
}

function replyTo(user) {
    if (user !== sessionStorage.getItem("name")) {
        document.getElementById('message').value = `[@${user}]: `;
    }
}

onWindow = true;
notifCnt = 0;
window.onfocus = function () { 
    onWindow = true;

    notifCnt = 0;

    title = document.getElementsByTagName("title")[0];
    title.text = sessionStorage.getItem('room');
}
window.onblur = function () { 
    onWindow = false;
}

function notify(increment) {
    if (!(onWindow)) {
        notifCnt += increment;

        title = document.getElementsByTagName("title")[0];
        title.text = `(${notifCnt}) ${sessionStorage.getItem('room')}`;
    }
}


function updateOldChat(response) {
    var req = JSON.parse(this.responseText);
    var data = req['response'][1];

    if (req['response'][0] === false) {
        sessionStorage.setItem("name", '');
        check();
        return '';
    }

    var data = JSON.parse(data)['data']

    // assigns a color to each users name
    for (i in data['users']) {
        if (!(data['users'][i] in usersColors)) {
            usersColors[data['users'][i]] = `${"#"+((1<<24)*Math.random()|0).toString(16)}`;
        }
    }

    var messages = '';

    var count = data['chat'].length;
    var lastUser = '';
    for (var i = 0; i < count; i++) {
        var message = data['chat'][i]

        var date = Object.keys(message);
        var user = message[date]['user'];
        var msg = message[date]['message'];
        
        // commands
        if (msg.includes('/commands')) {
            msg = commands;
        }
        if (msg.includes('/n')) {
            msg = msg.split("/n").join("<br>");
        }
        if (msg.includes('/color(') && msg.includes(')')) {
            var sub = msg.substring(msg.lastIndexOf("/color("), msg.lastIndexOf(")") + 1);
            var color = sub.substring(sub.lastIndexOf("(") + 1, sub.lastIndexOf(")"));
            if (isColor(color)) {
                msg = msg.replace(sub, '');
                msg = `<p style='margin: 0 0; word-wrap: break-word; width: 100%; float: left; color: ${color}'>` + msg + '</p>';
            }
        }
        if (msg.includes('[@') && msg.includes(']')) {
            var sub = msg.substring(msg.lastIndexOf("[@"), msg.lastIndexOf("]") + 1);

            var username = sub.substring(sub.lastIndexOf("@"), sub.lastIndexOf("]"));
            username = `<p style='display: inline;white-space: nowrap; margin: 0 0; word-wrap: break-word; float: left; color: blue; font-weight: 100'>` + username +'</p>';

            msg = msg.replace(sub, username);
        }
        // /commands
        
        // assigns a color to each users name
        if (!(user in usersColors)) {
            usersColors[user] = `${"#"+((1<<24)*Math.random()|0).toString(16)}`;
        }

        // add image if message has image
        var chatImg = '';
        if (message[date].hasOwnProperty('image')) {
            chatImg = `<div id='${message[date]['image']}' class='chatImage'></div>`;
        }

        // adds the message element for each messsage to messages
        if (user !== lastUser) {
            messages += `
            <div class='messageWrapper'>
            <div class='triangle'></div>
            <div class='msgContainer' onclick='replyTo("${user}")'>
                <h4 class='name' style='font-weight: 900; color: ${usersColors[user]}'>@${user}</h4>
                <h2 class='msg'>${msg}</h2>
                ${chatImg}
                <h4 class='date'>${date}</h4></div></div>`;
        }
        else {
            messages += `
            <div class='messageWrapper'>
            <div class='triangle' style='opacity: 0; margin-top: -5px;'></div>
            <div class='msgContainer' style='margin-top: -5px;' onclick='replyTo("${user}")'>
                <h2 class='msg'>${msg}</h2>
                ${chatImg}
                <h4 class='date'>${date}</h4></div></div>`;
        }

        lastUser = user;
    }

    // sets oldmessage text to messages
    document.getElementById('oldMessages').innerHTML = messages;

    // hides show more button
    document.getElementById('showOldMsgs').style.display = 'none';
}

// requests for the old messages
function getOldChat() {
    var data = new FormData();
    data.append('room', sessionStorage.getItem("room"));
    data.append('password', sessionStorage.getItem("password"));
    loadFile("/getoldchat", updateOldChat, data, 'POST');
}


// toggles emoji buttons visibility
function toggleEmojis() {
    emojis = document.getElementById('emojis');

    if (emojis.classList.contains('showEmojis')) {
        emojis.classList.remove('showEmojis');
        emojis.classList.add('hide');
    }
    else {
        emojis.classList.add('showEmojis');
        emojis.classList.remove('hide');
    }
}
// creates all the emoji button elements and adds their functionality
function makeEmojiBtns() {
    var first = 128512;
    var last = 129488;

    var container = document.getElementById('emojis');

    var emoji = '';
    var html = '';
    var box = '<div class="emojiBox">';
    var count = 24;
    for (var i = first; i < last; i++) {
        emoji = `&#${i};`;
        box += `
        <div style='position: relative; padding: 0 0; display: flex; flex-direction: column-reverse; overflow-y: visible;'>
            <a id='${emoji}Btn' class="emojiBtn" onclick="addEmoji('${emoji}')">${emoji}</a>
            <div id="${emoji}" class='hide' style='position: absolute; transition: all 0.2s; padding: 0 0'>
                <div class='emojiBtnHoverChild'>${emoji}</div>
            </div>
        </div>`

        count--;
        if (count === 0) {
            count = 24;
            box += '</div>';
            html += box;
            box = '<div class="emojiBox">';
        }
    }
    container.innerHTML = html;
}

function addEmoji(emoji) {
    document.getElementById('message').value += ` ${emoji} `;

    show = document.getElementById(`${emoji}`);
    if (!show.classList.contains('emojiBtnHover')) {
        show.classList.remove('hide');
        show.classList.add('emojiBtnHover');

        setTimeout( function() {
            show.classList.add('hide');
            show.classList.remove('emojiBtnHover');
        }, 150)
    }
}

//------------------ send image ------------------//
imageAsFile = '';

function clearUploadedChatImage() {
    document.getElementById('chatShowImg').style.backgroundImage =  'url("")';
    imageAsFile = '';

    hideImage();
}

function showImage() {
    var box = document.getElementById('chatShowImgContainer');
    var arrow = document.getElementById('imgTriangle');

    if (box.classList.contains('hide')) {
        box.classList.remove('hide');
        arrow.classList.remove('hide');
    }
}
function hideImage() {
    var box = document.getElementById('chatShowImgContainer');
    var arrow = document.getElementById('imgTriangle');

    if (!(box.classList.contains('hide'))) {
        box.classList.add('hide');
        arrow.classList.add('hide');
    }
}

window.addEventListener('load', function() {
  document.querySelector('input[type="file"]').addEventListener('change', function() {
      if (this.files && this.files[0]) {
            var img = document.getElementById('chatShowImg');
            var imageFile = URL.createObjectURL(this.files[0]);

            img.style.backgroundImage = `url("${imageFile}")`; // set src to blob url
                    
            imageAsFile = this.files[0];

            showImage();
      }
  });
});


isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

var inputElement = document.getElementById("message");
inputElement.focus();
if(!isMobile.any()) {
    // message input always selected, not for mobile
    inputElement.addEventListener("blur", function(event){
        inputElement.focus();
    }); 
}
else {
    // hides emoji button on mobile
    document.getElementById('chatBtn').style.display = 'none';
}

