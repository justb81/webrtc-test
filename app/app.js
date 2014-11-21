/**
 * Created by bastian on 20.11.14.
 */

/**
 * Client
 * @type {Peer}
 */
var peer = null, appDom = document.getElementById('app'), connectionIds = [];

function startHost() {
    /**
     * Keinen host gefunden, also werde ich selbst zum Host
     */
    peer = new Peer('host', {key: 'tezrd3xl4ympwrk9', debug: 2});
    peer.on('connection', function (conn) {setupConnection(conn);});
    document.getElementById('peertype').innerHTML = 'Host';
}

function setupConnection(conn) {
    /**
     * Daten empfangen
     */
    conn.on('data', function (data) {
        console.log('Received', data, conn);
    })
    /**
     * Verbindung wurde aufgebaut
     */
    .on('open', function () {
            connectionIds.push(conn.peer);
            log('Neue Verbindung mit '+conn.peer);
            showConnectedGuests(conn.provider);
    })
    /**
     * Verbindungsabbrüche
     */
    .on('close', function () {
            log('Verbindung zu '+conn.peer+' verloren.');
            connectionIds.splice(connectionIds.indexOf(conn.peer), 1);
            showConnectedGuests(conn.provider);
            conn.close();
        });
}

function showConnectedGuests(peer) {
    var guestList = document.createElement('ul'),
        domGuestList = document.getElementById('guest-list');
    guestList.id = 'guest-list';
    guestList.innerHTML = '';

    connectionIds.forEach(function(connid, i) {
        var li = document.createElement('li');
        li.innerHTML = connid;
        guestList.appendChild(li);
    });
    if (domGuestList) {
        appDom.removeChild(domGuestList);
    }
    appDom.appendChild(guestList);
}


function log(message, el) {
    var logElement = el || document.getElementById('log');
    if (!logElement) {
        logElement = createLog();
    }
    logElement.innerHTML = message;
}

function createLog() {
    var logElement = document.createElement('div');
    logElement.id = 'log';
    appDom.appendChild(logElement);
    return logElement;
}

document.addEventListener('DOMContentLoaded', function () {
    /**
     * Try to connect to Host
     * @type {Window.Peer}
     */
    peer = new Peer({key: 'tezrd3xl4ympwrk9', debug: 2});
    log('Versuche Verbindungsaufbau zum Server…');

    peer.on('error', function (err) {
        if (err.type === 'peer-unavailable') {
            log('Server nicht gefunden. Werde selbst zum Server…');
            startHost();
        } else {
            console.log(err);
        }
    }).on('close', startHost);

    /**
     * Versuche Host zu erreichen
     */
    var conn = peer.connect('host');

    setupConnection(conn);

    conn.on('open', function(){conn.send({hello:'world!'});});

});


// Make sure things clean up properly.
window.onunload = window.onbeforeunload = function(e) {
  if (!!peer && !peer.destroyed) {
    peer.destroy();
  }
};