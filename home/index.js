function joinRoom(name) {
    sessionStorage.setItem("room", name);

    if (document.getElementById(name).getElementsByTagName('span')[0].classList.contains('fa-lock')) {
        var password = prompt('enter password', '');
        sessionStorage.setItem('password', password);
    }
    else {
        sessionStorage.setItem('password', '');
    }

    tryPassword(name);
}

function tryPasswordResponse(response) {
    var response = JSON.parse(this.responseText)['response'];
    if (response[0]) {
        window.location.href = 'https://juddcraft12.github.io/RHS-SWCR/chat';
    }
    else {
        alert(response[1]);
    }
}

function tryPassword(name) {
    var data = new FormData();
    data.append('room', name);
    data.append('password', sessionStorage.getItem('password'));
    
    loadFile("/trypassword", tryPasswordResponse, data, 'POST');
}

imageAsFile = '';
function makeRoom() {
    var roomName = document.getElementById('roomName');
    var roomPassword = document.getElementById('roomPassword');
    if (roomName.value !== '' || roomName.value !== null) {
        var data = new FormData();
        data.append('room_name', roomName.value);
        data.append('room_password', roomPassword.value);
        data.append('image', imageAsFile);
        
        loadFile("/makeroom", showMessage, data, 'POST');

        roomName.value = '';
        roomPassword.value = '';
        document.getElementById('makeRoomExample').style.backgroundImage =  'url("https://github.com/juddcraft12/RHS-SWCR/blob/main/home/default_room.png")';
        document.getElementById('previewName').innerHTML = '';
        var lock = document.getElementById('previewLock');
        if (lock.classList.contains('fa-lock')) {
            lock.classList.remove('fa-lock');
        }
    }
    
}

function updateRooms(response) {
    var req = JSON.parse(this.responseText);
    var data = req['response'][1];
    var data = JSON.parse(data)['data'];
    

    // displays rooms in order of most to least users
    order = []
    for (i in data) {
        if (!order.includes(data[i]['users'])) {
            order.push(data[i]['users'])
        }   
    }
    order = order.sort()
    while (order.length !== 0) {
        mostUsers = order.pop()
        for (i in data) {
            if (data[i]['users'] === mostUsers) {
                makeRoomClone(i, data[i]); 
            }
            
        }    
    }
    
    // after the rooms are made, the images for each room is loaded and placed
    setTimeout( function() {
        var rooms = document.getElementById("roomsContainer").getElementsByClassName("roomBox");
        placeRoomImages(rooms, 0);
    }, 1)

}

var index = 0;
var colors = ['#96abb5']
function makeRoomClone(room, data) {
    var itm = document.getElementById("exampleRoom");
    var cln = itm.cloneNode(true);
    cln.id = `${room}`;
    cln.style.display = 'inline-block';

    cln.style.backgroundColor = colors[index];
    index ++;
    if (index >= colors.length) {
        index = 0;
    }

    cln.getElementsByTagName('h')[0].innerHTML = `${room}`.split("_").join(" ");
    var s = 's';
    if (data['users'] == 1) {
        s = '';
    }
    cln.getElementsByTagName('p')[0].innerHTML = `${data['users']} user${s} online`;

    if (data['password']) {
        var span = cln.getElementsByTagName('span')[0];
        span.classList.add('fa-lock');
    }
    
    document.getElementById("roomsContainer").appendChild(cln); // adds the clone div to quizContainer
}

function placeRoomImages(rooms, i) {
    if (i === rooms.length) {
        return false
    }

    var room = rooms[i];

    var image = getImage(rooms, room.id);

    setTimeout( function() {
        var x = i + 1;
        placeRoomImages(rooms, x);
    }, 1);
}

function refreshRooms() {
    // clones the example element in rooms container and deletes all other elements for refresh
    var itm = document.getElementById("exampleRoom");
    var cln = itm.cloneNode(true);
    var e = document.getElementById('roomsContainer');
    var child = e.lastElementChild;  
    while (child) { 
        e.removeChild(child); 
        child = e.lastElementChild; 
    }
    e.appendChild(cln);

    getRooms();
}

function getRooms(callback) {
    var data = new FormData();
    
    loadFile("/getrooms", updateRooms, data, 'POST');
}

// will continously request the session info from server every delay milli-seconds
var delay = 0;
function update() {
    window.setTimeout(function() {
        getRooms();
        //update();
    }, delay);
}

function toggleShowMakeRoom() {
    var contents = document.getElementById('makeRoom');
    var button = document.getElementById('makeRoomBtn');

    if (contents.classList.contains('hide')) {
        contents.classList.remove('hide');
        contents.classList.add('showFlex');

        button.classList.remove('fa-caret-down');
        button.classList.add('fa-caret-up');
    }
    else {
        contents.classList.add('hide');
        contents.classList.remove('showFlex');

        button.classList.add('fa-caret-down');
        button.classList.remove('fa-caret-up');
    
    }

}

function getImage(rooms, room) {
    var request = new XMLHttpRequest();
    var url = `${server}/getimage/?room=${room}`;

    request.open('GET', url, true);  // `false` makes the request synchronous

    request.onload = function (e) {
        if (request.readyState === 4) {
            var type = request.getResponseHeader('content-type');
            if (type === 'application/json') {
                try {
                    rooms[room].style.backgroundImage = 'url("https://github.com/juddcraft12/RHS-SWCR/blob/main/home/default_room.png")';
                }
                catch(err) {

                }
            }
            if (type === 'image/png') {
                try {
                    rooms[room].style.backgroundImage = `url("${url}"`;
                }
                catch(err) {
                    
                }
            }
        }
    }
    request.send(null);
}


//-------------- file uploads --------------//
window.addEventListener('load', function() {
  document.querySelector('input[type="file"]').addEventListener('change', function() {
      if (this.files && this.files[0]) {
            var img = document.getElementById('makeRoomExample');
            var imageFile = URL.createObjectURL(this.files[0])
            img.style.backgroundImage = `url("${imageFile}")`; // set src to blob url
                    
            imageAsFile = this.files[0];
      }
  });
});

function dropHandler(ev) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    var img = document.getElementById('makeRoomExample');
    var imageFile = URL.createObjectURL(ev.dataTransfer.items[0].getAsFile())
    img.style.backgroundImage = `url("${imageFile}")`;
    
    imageAsFile = ev.dataTransfer.items[0].getAsFile();
}
function dragOverHandler(ev) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
}

function clearUploadedImage() {
    imageAsFile = '';
    document.getElementById('makeRoomExample').style.backgroundImage =  'url("https://github.com/juddcraft12/RHS-SWCR/blob/main/home/default_room.png")';
}

//-------------- rooms ordering --------------//
function search() {
    var input = document.getElementById('search');
    filter = input.value.toUpperCase();

    rooms = document.getElementById('roomsContainer');
    room = rooms.getElementsByClassName("roomBox");

    var list = []
    for (i = 1; i < room.length; i++) {
        txtValue = room[i].getElementsByTagName('h')[0].innerText;

        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            room[i].style.display = "block";
        } else {
            room[i].style.display = "none";
        }

        list.push(room[i].style.display)
    }

    if (!list.includes('block')) {
        var sign = document.getElementById('noResults');
        sign.style.display = 'block';
        sign.getElementsByTagName('h')[0].innerText = `No search results found for "${input.value}".`

        var search = document.getElementById('search');
        if (!search.classList.contains('noResultsSearch')) {
            search.classList.add('noResultsSearch')
        }
    }
    else {
        var sign = document.getElementById('noResults');
        sign.style.display = 'none';

        var search = document.getElementById('search');
        if (search.classList.contains('noResultsSearch')) {
            search.classList.remove('noResultsSearch')
        }
    }
    
}

