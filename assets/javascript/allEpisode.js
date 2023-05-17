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
        console.log(p2XmlDescription);
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
      // console.log(feedObject[2].description);
      // let first = feedObject[2].description.replaceAll("<p>", "");
      // let second = first.replaceAll("</p>", "");
      // console.log(second);
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
  var hours = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) {
    return minutes + " minutes";
  } else if (minutes === 0) {
    if (hours === 1) {
      return hours + ' hour';
    } else {
      return hours + ' hours'
    }
  } else {
    return hours + ' hours, ' + minutes + ' minutes';
  }
}

function episodeAudio(rssFeed) {
  for (let i = 0; i < rssFeed.length; i++) {
    let audioDiv = document.createElement("div");
    let audio = document.createElement("audio");
    let seekBar = document.createElement("input");
    seekBar.setAttribute("id", `seek${i}`);
    seekBar.setAttribute("type", "range");
    seekBar.setAttribute("min", 0);
    seekBar.setAttribute("step", 1);
    seekBar.setAttribute("value", 0);
    audio.setAttribute("id", `episodeAudio${i}`);
    audio.setAttribute("src", rssFeed[i].map.get(`${i}`));
    let timeElapsed = document.createElement("span");
    timeElapsed.setAttribute("id", `currentTime${i}`);
    timeElapsed.innerHTML = "0:00";
    let duration = document.createElement("span");
    let seconds = formatTime(rssFeed[i].durationSeconds);
    duration.innerHTML = seconds;
    audioDiv.append(audio, timeElapsed, seekBar, duration);
    let div = document.getElementById(`episodeCard${i}`);
    div.append(audioDiv);
  }
}

function episodeAudioBetter(rssFeed, num) {
  //basically gonna import the rssFeed and grab that element in the array based on the num
  // let desiredObject = rssFeed[num];
  //now dynamically add all the stuff to episodeCard${i}, including the mp3 file based on the map key of num
  // let episodeCard = document.querySelector(`episodeCard${num}`);
  let audioDiv = document.createElement("div");
  let audio = document.createElement("audio");
  let timeDiv = document.createElement("div");
  timeDiv.setAttribute("class", "timeControls")
  let seekBar = document.createElement("input");
  seekBar.setAttribute("id", `seek${num}`);
  seekBar.setAttribute("type", "range");
  seekBar.setAttribute("min", 0);
  seekBar.setAttribute("step", 1);
  seekBar.setAttribute("value", 0);
  audio.setAttribute("id", `episodeAudio${num}`);
  audio.setAttribute("src", rssFeed.map.get(`${num}`));
  let timeElapsed = document.createElement("span");
  timeElapsed.setAttribute("id", `currentTime${num}`);
  timeElapsed.innerHTML = "0:00";
  let duration = document.createElement("span");
  let seconds = formatTime(rssFeed.durationSeconds);
  duration.innerHTML = seconds;
  timeDiv.append(timeElapsed, seekBar, duration);
  audioDiv.append(audio, timeDiv);
  let div = document.getElementById(`episodeCard${num}`);

  let audioControlDiv = document.querySelector(`.audioControls${num}`);
  // let playButtonCurrent = document.querySelector(`.play${num}`);
  let playButton = document.createElement("button");
  playButton.setAttribute("id", `play${num}`);
  playButton.innerHTML = "⏸";
  let skipButton = document.createElement("button");
  skipButton.setAttribute("id", `skip${num}`);
  let skipImage = document.createElement("img");
  let skipImageSrc = "../images/skip.svg";
  skipImage.setAttribute("src", skipImageSrc);
  skipImage.setAttribute("id", `skip${num}`);
  let rewindButton = document.createElement("button");
  rewindButton.setAttribute("id", `rewind${num}`);
  let rewindImage = document.createElement("img");
  let rewindImageSrc = "../images/rewind.svg";
  rewindImage.setAttribute("src", rewindImageSrc);
  rewindImage.setAttribute("id", `rewind${num}`);
  skipButton.append(skipImage);
  rewindButton.append(rewindImage);
  audioControlDiv.append(rewindButton, playButton, skipButton);

  div.append(audioDiv);
  // episodeCard.append(audioDiv)
}

function individualEpisodeCard(rssFeed) {
  let page = document.getElementById("rssFeed");
  for (let i = 0; i < rssFeed.length; i++) {
    let article = document.createElement("article");
    article.setAttribute("style", "margin: 1rem; border: 2px solid black");
    article.setAttribute("id", `episodeCard${i}`);
    let title = document.createElement("h1");
    title.innerHTML = rssFeed[i].title;
    let description = document.createElement("section");
    description.innerHTML = rssFeed[i].description;
    let pubDate = document.createElement("p");
    pubDate.innerHTML = rssFeed[i].pubDate;
    let author = document.createElement("p");
    author.innerHTML = rssFeed[i].author;
    let duration = document.createElement("p");
    duration.innerHTML = convertSecondsToHoursMinutes(rssFeed[i].durationSeconds);
    let audioControls = document.createElement("div");
    audioControls.setAttribute("class", `audioControls${i}`);
    let startButton = document.createElement("button");
    startButton.innerHTML = "⏵";
    startButton.setAttribute("id", `start${i}`);
    // audioControls.append(startButton, playButton);
    article.append(title, description, pubDate, author, duration, startButton, audioControls);
    page.append(article);
  }
  // episodeAudio(rssFeed);
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
    // btn.className = 'pause'
    audioSourceNumber.play();
    playState = true;
  } else {
    button.innerHTML = "⏵";
    // btn.className = 'play';
    audioSourceNumber.pause();
    playState = false;
  // return false;
  }
  
}
// function pauseAudio(num) {
//   let source = "episodeAudio" + num;
//   let audioSourceNumber = document.getElementById(source);
//   audioSourceNumber.pause();
// }
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
      let startButton = document.querySelector(`#start${num}`);
      startButton.remove();
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
      // rssFeedData().then(rssFeed => {
      //   let object = rssFeed[num]
      //   episodeAudioBetter(object,num)
      //   playAudio(num);
      // })
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


