function rssFeedData() {
  let feedObject = [];
  let mp3Map = new Map();
    return fetch("https://anchor.fm/s/3bc06940/podcast/rss")
    .then(response => response.text())
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    .then(data => {
      const items = data.querySelectorAll("item");
      for (let i = 0; i < items.length; i++) {
        let obj = {};
        obj.title = items[i].querySelector("title").innerHTML.slice(9,-3);
        obj.author = items[i].childNodes[9].innerHTML.slice(9, -3);
        let description = items[i].querySelector("description").innerHTML.split('--');
        let xmlDescription = description[0].slice(9);
        let pXmlDescription = xmlDescription.replaceAll("<p>", "");
        let p2XmlDescription = pXmlDescription.replaceAll("</p>", "");
        obj.description = p2XmlDescription;
        obj.link = items[i].querySelector("enclosure").getAttribute("url");
        let pubDate = new Date(items[i].querySelector("pubDate").innerHTML);
        obj.pubDate = pubDate.toLocaleDateString(); 
        let duration = items[i].childNodes[19].innerHTML.split(":");
        let seconds = (+duration[0]) * 60 * 60 + (+duration[1]) * 60 + (+duration[2]);
        obj.durationSeconds = seconds;
        mp3Map.set(`${i}`, items[i].querySelector("enclosure").getAttribute("url"))
        obj.map = mp3Map;
        feedObject.push(obj);
      }    
      return feedObject;
    });
}

function formatTime(seconds) {
  var hours = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds - (hours * 3600)) / 60);
  var remainingSeconds = seconds - (hours * 3600) - (minutes * 60);

  var result = "";
  if (hours > 0) {
    result += hours + ":" + padZero(minutes) + ":" + padZero(remainingSeconds);
  } else {
    result += minutes + ":" + padZero(remainingSeconds);
  }

  return result;
}

function padZero(num) {
  return (num < 10 ? "0" : "") + num;
}

function updateCurrentTime(audio, num) {
  audio.addEventListener("timeupdate", function() {
    const progress = (audio.currentTime / audio.duration) * 100;
    let seekBar = document.getElementById(`seek${num}`);
    seekBar.value = progress;
    let currentTime = document.getElementById(`currentTime${num}`);
    const currentMinutes = Math.floor(audio.currentTime / 60);
    const currentSeconds = Math.floor(audio.currentTime % 60);
    currentTime.innerHTML = currentMinutes + ":" + (currentSeconds < 10 ? "0" : "") + currentSeconds;
  })
}

function convertSecondsToHoursMinutes(seconds) {
  let h = Math.floor(seconds / 3600);
  let m = Math.floor(seconds % 3600 / 60);

  let hDisplay = h > 0 ? h + (h == 1 ? " hour " : " hours, ") : "";
  let mDisplay = m > 0 ? m + (m == 1 ? " minute " : " minutes ") : "";
  return hDisplay + mDisplay; 
}

function episodeAudioBetter(rssFeed, num) {
  //basically gonna import the rssFeed and grab that element in the array based on the num
  //now dynamically add all the stuff to episodeCard${i}, including the mp3 file based on the map key of num
  let audioSrc = rssFeed.map.get(num);
  let seconds = formatTime(rssFeed.durationSeconds);
  
  let div = document.getElementById(`episodeCard${num}`);
  let seekBarHTML = `
  <div>
    <audio id=${`episodeAudio${num}`} src=${audioSrc} ></audio>
    <div class="timeControls">
      <span id=${`currentTime${num}`}>0:00</span>
      <input id=${`seek${num}`} type="range" min="0" step="1" value="0">
      <span>${seconds}</span>
    </div>
  </div>`;

  div.innerHTML += seekBarHTML;

  let audioControlDiv = document.querySelector(`.audioControls${num}`);

  let audioHTML = `
  <div class=${`audioControls${num}`}>
    <button id=${`rewind${num}`}>
      <img src="../images/rewind.svg" id=${`rewind${num}`} >
    </button>
    <button id=${`play${num}`}>⏸</button>
    <button id=${`skip${num}`}>
      <img src="../images/skip.svg" id=${`skip${num}`} >
    </button>
  </div>`;
  
  audioControlDiv.innerHTML = audioHTML;

}

function individualEpisodeCard(rssFeed) {
  let page = document.getElementById("rssFeed");
  let html = ``;
  for (let i = 0; i < rssFeed.length; i++) {
    let durationNew = convertSecondsToHoursMinutes(rssFeed[i].durationSeconds);
    html += `
    <article style="margin: 1rem; border: 2px solid black;" id=${`episodeCard${i}`}>
      <h1>${rssFeed[i].title}</h1>
      <div style="display: flex; justify-content: space-between; font-weight: 200;">
        <p>${rssFeed[i].author}</p>
        <p>${rssFeed[i].pubDate}</p>
      </div>
      <section>
        ${rssFeed[i].description}
      </section>
      <div style="display: flex; justify-content: space-between; align-items: baseline;" id=${`startAudio${i}`}>
        <button id=${`start${i}`}>
          <img src="../images/play.svg" id=${`start${i}`}>
        </button>
        <p>${durationNew}</p>
      </div>
      <div class=${`audioControls${i}`}></div>
    </article>`;
  }
  page.innerHTML = html;
}



function displayFeed() {
  rssFeedData().then((rssFeed) => {
    individualEpisodeCard(rssFeed);
  })
}


let playState = false;
function playAudio(num) {
  let source = "episodeAudio" + num;
  let audioSourceNumber = document.getElementById(source);
  updateCurrentTime(audioSourceNumber, num);
  let buttonSource = "play" + num;
  let button = document.getElementById(buttonSource);
  if (playState === false) {
    button.innerHTML = "⏸";
    audioSourceNumber.play();
    playState = true;
  } else {
    button.innerHTML = "⏵";
    audioSourceNumber.pause();
    playState = false;
  }
  
}

function skipAudio(num) {
  let source = "episodeAudio" + num;
  let audioSourceNumber = document.getElementById(source);
  audioSourceNumber.currentTime += 10;
}
function rewindAudio(num) {
  let source = "episodeAudio" + num;
  let audioSourceNumber = document.getElementById(source);
  audioSourceNumber.currentTime -= 10;
}
function seekAudio(num) {
  let audioSource = "episodeAudio" + num;
  let audioSourceNumber = document.getElementById(audioSource);
  let seekBar = document.getElementById(`seek${num}`);
  let time = audioSourceNumber.duration * (seekBar.value / 100);
  audioSourceNumber.currentTime = time;
  seekBar.value = (audioSourceNumber.currentTime / audioSourceNumber.duration) * 100;
  playAudio(num);
}

function getSpecificAudio() {
  document.addEventListener("click", function(e) {
    if (e.target.id.includes('start')) {
      let num;
      let id = e.target.id;
      let smallId = id.split("t");
      num = smallId[2];
      let startAudioDiv = document.querySelector(`#startAudio${num}`);
      startAudioDiv.remove();
      rssFeedData().then(rssFeed => {
        let object = rssFeed[num]
        episodeAudioBetter(object,num)
        playAudio(num);
      })
    }
    else if (e.target.id.includes('play')) {
      let num;
      let id = e.target.id;
      let smallId = id.split("y");
      num = smallId[1];
      playAudio(num);
    } else if (e.target.id.includes('pause')) {
      let num;
      let id = e.target.id
      let smallId = id.split("e");
      num = smallId[1];
      pauseAudio(num);
    } else if (e.target.id.includes('skip')) {
      let num;
      let id = e.target.id;
      let smallId = id.split("p");
      num = smallId[1];
      skipAudio(num);
    } else if (e.target.id.includes("rewind")) {
      let num;
      let id = e.target.id;
      let smallId = id.split("d");
      num = smallId[1];
      rewindAudio(num);
    }
  })
  document.addEventListener("input", function(e) {
    if (e.target.id.includes("seek")) {
      let num;
      let id = e.target.id;
      let smallId = id.split("k");
      num = smallId[1];
      seekAudio(num);
    }
  })
}

displayFeed();
getSpecificAudio();


