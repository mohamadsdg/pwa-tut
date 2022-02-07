var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");
var form = document.querySelector("form");
var titleInput = document.querySelector("#title");
var locationInput = document.querySelector("#location");

function openCreatePostModal() {
  // createPostArea.style.display = 'block';
  // setTimeout(function() {
  createPostArea.style.transform = "translateY(0)";
  // }, 1);
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
  console.log("clicked");
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
  fetch(
    "https://pwgram-30323-default-rtdb.asia-southeast1.firebasedatabase.app/posts.json",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
        image:
          "https://firebasestorage.googleapis.com/v0/b/pwgram-30323.appspot.com/o/sf-boat.jpg?alt=media&token=c2fa4ba0-bfca-419b-acc9-b016e78d956c",
      }),
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
