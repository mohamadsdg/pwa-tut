var deferredPrompt;
var enableNotificationButtons = document.querySelectorAll(
  ".enable-notifications"
);

if (!window.Promise) {
  window.Promise = Promise;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(function () {
      console.log("Service worker registered!");
    })
    .catch(function (err) {
      console.log(err);
    });
}

window.addEventListener("beforeinstallprompt", function (event) {
  console.log("beforeinstallprompt fired");
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function askForNotification() {
  Notification.requestPermission().then((rsp) => {
    console.log("User Choice", rsp);
    if (rsp !== "granted") {
      console.log("not granted permission for notification");
    } else {
    }
  });
}

if ("Notification" in window) {
  for (let i = 0; i < enableNotificationButtons.length; i++) {
    enableNotificationButtons[i].style.display = "iniline-block";
    enableNotificationButtons[i].addEventListener("click", askForNotification);
  }
}
