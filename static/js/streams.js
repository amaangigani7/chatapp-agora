const APP_ID = "fa59977c055f46bebb74604e958e4bab";
const CHANNEL = sessionStorage.getItem("room");
const TOKEN = sessionStorage.getItem("token");
console.log(CHANNEL);

let UID = Number(sessionStorage.getItem("UID"));

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

let localTracks = [];
let remoteUsers = {};

let joinAndDisplayLocalStream = async () => {
  document.getElementById("room-name").innerText = CHANNEL;
  client.on("user-publish", handleUserJoin);
  client.on("user-left", handlerUserleft);
  await client.join(APP_ID, CHANNEL, TOKEN, UID);
  // try {
  //   await client.join(APP_ID, CHANNEL, TOKEN, UID);
  // } catch (error) {
  //   console.error(error);
  //   window.open("/", "_self");
  // }

  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

  let player = `<div  class="video-container" id="user-container-${UID}">
                  <div class="video-player" id="user-${UID}"></div>
                  <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                </div>`;

  document
    .getElementById("video-streams")
    .insertAdjacentElement("beforeend", player);

  localTracks[1].play(`user-${UID}`);

  await client.publish([localTracks[audio], localTracks[video]]);
};

let handleUserJoin = async (user, mediaType) => {
  remoteUsers[user.uid] = user;
  await client.subscribe(user, mediaType);

  if (mediaType === "video") {
    let player = document.getElementById(`user-container-${user.uid}`);
    if (player != null) {
      player.remove();
    }
    player = `<div  class="video-container" id="user-container-${user.uid}">
                <div class="video-player" id="user-${user.uid}"></div>
                <div class="username-wrapper"><span class="user-name">${user.uid}</span></div>
              </div>`;

    document
      .getElementById("video-streams")
      .insertAdjacentElement("beforeend", player);

    user.videoTrack.play(`user-${user.uid}`);
  }

  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};

let handlerUserleft = async (user) => {
  delete remoteUsers[user.uid];
  document.getElementById(`user-container-${user.uid}`).remove();
};

let leaveAndRemoveLocalStream = async () => {
  for (let i = 0; localTracks.length > i; i++) {
    localTracks[i].stop();
    localTracks[i].close();
  }

  await client.leave();
  window.open("/", "_self");
};

let toggleCamera = async (e) => {
  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    e.target.style.backgroundColor = "#FFFF";
  } else {
    await localTracks[1].setMuted(true);
    e.target.style.backgroundColor = "rgb(255, 80, 80, 1)";
  }
};

let toggleMic = async (e) => {
  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    e.target.style.backgroundColor = "#FFFF";
  } else {
    await localTracks[0].setMuted(true);
    e.target.style.backgroundColor = "rgb(255, 80, 80, 1)";
  }
};

joinAndDisplayLocalStream();

document
  .getElementById("leave-btn")
  .addEventListener("click", leaveAndRemoveLocalStream);

document.getElementById("camera-btn").addEventListener("click", toggleCamera);

document.getElementById("mic-btn").addEventListener("click", toggleMic);
