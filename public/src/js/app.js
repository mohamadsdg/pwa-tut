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

function displayConfirmNotification() {
  // new Notification("successfully subscribed!", {
  //   body: "you successfully subscribed to our Notification service!",
  // });

  if ("serviceWorker" in navigator) {
    var option = {
      body: "you successfully subscribed to our Notification service!",
      icon: "/src/images/icons/app-icon-96x96.png",
      image: "/src/images/sf-boat.jpg",
      dir: "ltr",
      lang: "en-US",
      vibrate: [100, 50, 200],
      badge: "/src/images/icons/app-icon-96x96.png",
      tag: "confirm-notify",
      renotify: false,
      actions: [
        {
          action: "confirm",
          title: "Okay",
          icon: "/src/images/icons/app-icon-96x96.png",
        },
        {
          action: "cancel",
          title: "Cancel",
          icon: "/src/images/icons/app-icon-96x96.png",
        },
      ],
    };
    navigator.serviceWorker.ready.then((swreg) => {
      swreg.showNotification("successfully subscribed (from sw)!", option);
    });
  }
}
function configurePushSub() {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  navigator.serviceWorker.ready
    .then((sw) => {
      return sw.pushManager.getSubscription();
    })
    .then((sub) => {
      if (sub !== null) {
        // Create a Subscription
      } else {
        // we have got a Subscription
      }
    });
}

function askForNotification() {
  Notification.requestPermission().then((rsp) => {
    console.log("User Choice", rsp);
    if (rsp !== "granted") {
      console.log("not granted permission for notification");
    } else {
      configurePushSub();
      // displayConfirmNotification();
    }
  });
}

if ("Notification" in window && "serviceWorker" in navigator) {
  for (let i = 0; i < enableNotificationButtons.length; i++) {
    enableNotificationButtons[i].style.display = "iniline-block";
    enableNotificationButtons[i].addEventListener("click", askForNotification);
  }
}
