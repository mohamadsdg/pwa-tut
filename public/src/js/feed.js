var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");
var form = document.querySelector("form");
var titleInput = document.querySelector("#title");
var locationInput = document.querySelector("#location");

var videoPlayer = document.querySelector("#player");
var canvasElement = document.querySelector("#canvas");
var captureButton = document.querySelector("#capture-btn");
var imagePicker = document.querySelector("#image-picker");
var imagePickerArea = document.querySelector("#pick-image");
var picture;

/**
 * polyfills
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Taking_still_photos#get_the_video
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#using_the_new_api_in_older_browsers
 */
function initializeMedia() {
  console.log("navigator->", navigator.mediaDevices);
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      var getUserMedia =
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if (!getUserMedia) {
        return Promise.reject(
          new Error("getUserMedia is not implemented in this browser")
        );
      }
      return new Promise(function (resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      if ("srcObject" in videoPlayer) {
        videoPlayer.srcObject = stream;
      } else {
        // Avoid using this in new browsers, as it is going away.
        videoPlayer.src = window.URL.createObjectURL(stream);
      }
      videoPlayer.style.display = "block";
    })
    .catch(function (err) {
      imagePickerArea.style.display = "block";
      captureButton.style.display = "none";

      console.log(err.name + ": " + err.message);
    });
}

captureButton.addEventListener("click", (event) => {
  // console.log("canvasElement", canvasElement);
  // console.log("videoPlayer", videoPlayer);
  canvasElement.style.display = "block";
  videoPlayer.style.display = "none";
  captureButton.style.display = "none";
  var context = canvasElement.getContext("2d");
  // console.log("context", context);
  context.drawImage(
    videoPlayer,
    0,
    0,
    canvas.width,
    videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width)
  );
  videoPlayer.srcObject.getVideoTracks().forEach(function (track) {
    // console.log("track", track);
    track.stop();
  });

  picture = dataURItoBlob(canvasElement.toDataURL());
  // console.log("picture", picture);
});

imagePicker.addEventListener("change", function (event) {
  picture = event.target.files[0];
});

function openCreatePostModal() {
  // createPostArea.style.display = 'block';
  // setTimeout(function() {
  createPostArea.style.transform = "translateY(0)";
  // }, 1);

  initializeMedia();

  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === "dismissed") {
        console.log("User cancelled installation");
      } else {
        console.log("User added to home screen");
      }
    });

    deferredPrompt = null;
  }

  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations()
  //     .then(function(registrations) {
  //       for (var i = 0; i < registrations.length; i++) {
  //         registrations[i].unregister();
  //       }
  //     })
  // }
}

function closeCreatePostModal() {
  createPostArea.style.transform = "translateY(100vh)";
  // createPostArea.style.display = 'none';
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

// Currently not in use, allows to save assets in cache on demand otherwise
function onSaveButtonClicked(event) {
  // console.log("clicked");
  if ("caches" in window) {
    caches.open("user-requested").then(function (cache) {
      cache.add("https://httpbin.org/get");
      cache.add("/src/images/sf-boat.jpg");
    });
  }
}

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = "url(" + data.image + ")";
  cardTitle.style.backgroundSize = "cover";
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.style.color = "white";
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = "center";
  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearCards();
  for (var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

function sendData() {
  const id = new Date().toISOString();
  var postData = new FormData();
  postData.append("id", id);
  postData.append("title", titleInput.value);
  postData.append("location", locationInput.value);
  if (picture) postData.append("file", picture, id + ".png");
  // console.log("postData", postData.get("file"));
  fetch(
    // "https://pwgram-30323-default-rtdb.asia-southeast1.firebasedatabase.app/posts.json",
    "http://localhost:3000/api/savePost",
    {
      method: "POST",
      body: postData,
    }
  ).then((res) => {
    console.log("Send Data", res);
    updateUI();
  });
}

var url =
  "https://pwgram-30323-default-rtdb.asia-southeast1.firebasedatabase.app/posts.json";
var networkDataRecived = false;

fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    console.log("from web data", data);
    networkDataRecived = true;
    var dataArray = [];
    for (var key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        dataArray.push(data[key]);
      }
    }
    updateUI(dataArray);
  });

if ("indexedDB" in window) {
  readAllData("posts").then((post) => {
    if (!networkDataRecived) {
      updateUI(post);
    }
  });
}

// if ("caches" in window) {
//   caches
//     .match(url)
//     .then((response) => {
//       console.log("from cache response", response);
//       if (response) return response.json();
//     })
//     .then(function (data) {
//       console.log("from cache data", data);
//       if (!networkDataRecived) {
//         var dataArray = [];
//         for (var key in data) {
//           if (Object.hasOwnProperty.call(data, key)) {
//             dataArray.push(data[key]);
//           }
//         }
//         updateUI(dataArray);
//       }
//     });
// }
form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (titleInput.value.trim() === "" || locationInput.value.trim() === "") {
    alert("Please Enter valid data !");
    return;
  }
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready
      .then((sw) => {
        var post = {
          id: new Date().toISOString(),
          title: titleInput.value,
          location: locationInput.value,
          image: picture,
        };
        writeDate("synce-posts", post)
          .then(() => {
            return sw.sync.register("sync-new-post");
          })
          .then(() => {
            var snackBarContainer = document.querySelector(
              "#confirmation-toast"
            );
            var data = { message: "Your Post Was Saved for syncing!" };
            snackBarContainer.MaterialSnackbar.showSnackbar(data);
          })
          .catch(() => {
            console.log("writeDate Sync-Post failed :(");
          });
      })
      .then(() => {
        console.log("Sync registered!");
      })
      .catch(() => {
        console.log("Sync registration failed :(");
      });
  } else {
    sendData();
  }
  closeCreatePostModal();
});
