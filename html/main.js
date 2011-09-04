var testContact = function() {
  function onSuccess (contacts)
  {
    alert('Found ' + contacts.length + ' contacts.');
  };
  
  function onError (contactError)
  {
    alert('onError!');
  };
  
  // find all contacts with 'Bob' in any name field
  var options = new ContactFindOptions ();
  options.filter = "Thevenin"; 
  options.filter = ""; 
  var fields = ["displayName", "name"];
  navigator.contacts.find (fields, onSuccess, onError, options);
};

var deviceInfo = function() {
    document.getElementById("platform").innerHTML = device.platform;
    document.getElementById("version").innerHTML = device.version;
    document.getElementById("uuid").innerHTML = device.uuid;
    document.getElementById("name").innerHTML = device.name;
    document.getElementById("width").innerHTML = screen.width;
    document.getElementById("height").innerHTML = screen.height;
    document.getElementById("colorDepth").innerHTML = screen.colorDepth;
};

function updateLocation (a)
{
  document.getElementById('latitude').innerHTML = roundNumber(a.latitude);
  document.getElementById('longitude').innerHTML = roundNumber(a.longitude);
  document.getElementById('altitude').innerHTML = roundNumber(a.altitude);
  document.getElementById('accuracy').innerHTML = roundNumber(a.accuracy);
}

var locationFail = function() 
{
  updateLocation({
    latitude : "-1",
    longitude : "-1",
    altitude : "-1",
    accuracy : "-1"
  });
  console.error ("getLocation locationFail");
};

var locationWatch = null;

var getLocation = function()
{
  var geo = new Geolocation ();

  geo.getCurrentPosition (updateLocation, locationFail, {});
};

var toggleLocatin = function ()
{
  if (!window.geo)
  {
    window.geo = new Geolocation ();
    //geo = navigator.geolocation;
  }
  updateLocation({
    latitude : "",
    longitude : "",
    altitude : "",
    accuracy : ""
  });
    
  if (locationWatch !== null)
  {
    window.geo.clearWatch (locationWatch);
    locationWatch = null;
  }
  else
  {
    var options = {};
    options.frequency = 100;
    locationWatch = window.geo.watchPosition (
      getLocation, locationFail, options);
  }
};

var beep = function() {
  testContact ();
  
 //   navigator.notification.beep(2);
};

var vibrate = function() {
    navigator.notification.vibrate(0);
};

function roundNumber(num) {
    var dec = 3;
    var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
}

var accelerationWatch = null;

function updateAcceleration (a)
{
  document.getElementById('x').innerHTML = roundNumber(a.x);
  document.getElementById('y').innerHTML = roundNumber(a.y);
  document.getElementById('z').innerHTML = roundNumber(a.z);
}

var toggleAccel = function ()
{
  if (accelerationWatch !== null)
  {
    navigator.accelerometer.clearWatch(accelerationWatch);
    updateAcceleration({
      x : "",
      y : "",
      z : ""
    });
    accelerationWatch = null;
  }
  else
  {
    var options = {};
    options.frequency = 100;
    accelerationWatch = navigator.accelerometer.watchAcceleration(
      updateAcceleration, function (ex) {
      alert("accel fail (" + ex.name + ": " + ex.message + ")");
    }, options);
  }
};

var compassWatch = null;

function updateCompass (a)
{
  document.getElementById('azimuth').innerHTML = roundNumber(a.azimuth);
  document.getElementById('calibrationLevel').innerHTML = 
    roundNumber(a.calibrationLevel);
}

var toggleCompass = function ()
{
  if (compassWatch !== null)
  {
    navigator.compass.clearWatch (compassWatch);
    updateCompass({
      azimuth : "",
      calibrationLevel : ""
    });
    compassWatch = null;
  }
  else
  {
    var options = {};
    options.frequency = 100;
    compassWatch = navigator.compass.watchHeading (
      updateCompass, function (ex)
    {
      alert("compas fail (" + ex.name + ": " + ex.message + ")");
    }, options);
  }
};

var preventBehavior = function(e) {
    e.preventDefault();
};

function dump_pic(data) {
    var viewport = document.getElementById('viewport');
    console.log(data);
    viewport.style.display = "";
    viewport.style.position = "absolute";
    viewport.style.top = "10px";
    viewport.style.left = "10px";
    document.getElementById("test_img").src = "data:image/jpeg;base64," + data;
}

function fail(msg) {
    alert(msg);
}

function show_pic() {
    navigator.camera.getPicture(dump_pic, fail, {
        quality : 50
    });
}

function close() {
    var viewport = document.getElementById('viewport');
    viewport.style.position = "relative";
    viewport.style.display = "none";
}

// This is just to do this.
function readFile() {
    navigator.file.read('/sdcard/phonegap.txt', fail, fail);
}

function writeFile() {
    navigator.file.write('foo.txt', "This is a test of writing to a file",
            fail, fail);
}

function contacts_success(contacts) {
    alert(contacts.length
            + ' contacts returned.'
            + (contacts[2] && contacts[2].name ? (' Third contact is ' + contacts[2].name.formatted)
                    : ''));
}

function get_contacts() {
    var obj = new ContactFindOptions();
    obj.filter = "";
    obj.multiple = true;
    obj.limit = 5;
    navigator.service.contacts.find(
            [ "displayName", "name" ], contacts_success,
            fail, obj);
}

var networkReachableCallback = function(reachability) {
    // There is no consistency on the format of reachability
    var networkState = reachability.code || reachability;

    var currentState = {};
    currentState[NetworkStatus.NOT_REACHABLE] = 'No network connection';
    currentState[NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK] = 'Carrier data connection';
    currentState[NetworkStatus.REACHABLE_VIA_WIFI_NETWORK] = 'WiFi connection';

    confirm("Connection type:\n" + currentState[networkState]);
};

function check_network() {
    navigator.network.isReachable("www.mobiledevelopersolutions.com",
            networkReachableCallback, {});
}

function init() {
  console.log ("init");
  console.error ("init");
  console.warn ("init");
  // the next line makes it impossible to see Contacts on the HTC Evo since it
  // doesn't have a scroll button
  document.addEventListener("touchmove", preventBehavior, false);
  document.addEventListener("deviceready", deviceInfo, true);
}
