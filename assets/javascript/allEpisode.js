function rssFeedData() {
    let feedObject = [];
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
          obj.description = description[0].slice(9);
          obj.link = items[i].querySelector("enclosure").getAttribute("url");
          let pubDate = new Date(items[i].querySelector("pubDate").innerHTML);
          obj.pubDate = pubDate.toLocaleDateString(); 
          let duration = items[i].childNodes[19].innerHTML.split(":");
          let seconds = (+duration[0]) * 60 * 60 + (+duration[1]) * 60 + (+duration[2]);
          obj.durationSeconds = seconds;
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
      audio.setAttribute("src", rssFeed[i].link);
      // introduce native controls below
      // audio.setAttribute("controls", true);
      // audio.setAttribute("preload", "metadata");

      let timeElapsed = document.createElement("span");
      timeElapsed.setAttribute("id", `currentTime${i}`);
      timeElapsed.innerHTML = "0:00";
      let duration = document.createElement("span");
      let seconds = formatTime(rssFeed[i].durationSeconds);
      duration.innerHTML = seconds;
      audioDiv.append(audio, timeElapsed, seekBar, duration);
      audioDiv.append(audio);
      let div = document.getElementById(`episodeCard${i}`);
      div.append(audioDiv);
    }
  }
  
  function individualEpisodeCard(rssFeed) {
    let page = document.getElementById("rssFeed");
    for (let i = 0; i < rssFeed.length; i++) {
      let article = document.createElement("article");
      article.setAttribute("style", "margin: 1rem; border: 2px solid black");
      article.setAttribute("id", `episodeCard${i}`);
      let title = document.createElement("h1");
      title.innerHTML = rssFeed[i].title;
      let description = document.createElement("p");
      description.innerHTML = rssFeed[i].description;
      let pubDate = document.createElement("p");
      pubDate.innerHTML = rssFeed[i].pubDate;
      let author = document.createElement("p");
      author.innerHTML = rssFeed[i].author;
      // let link = document.createElement("p");
      // link.innerHTML = rssFeed[i].link;
      let audioControls = document.createElement("div");
      audioControls.setAttribute("class", "audioControls");
      let playButton = document.createElement("button");
      playButton.setAttribute("id", `play${i}`);
      playButton.innerHTML = "⏵";
      // let pauseButton = document.createElement("button");
      // pauseButton.setAttribute("id", `pause${i}`);
      // pauseButton.innerHTML = "Pause";
      let skipButton = document.createElement("button");
      skipButton.setAttribute("id", `skip${i}`);
      skipButton.innerHTML = "Skip"
      let rewindButton = document.createElement("button");
      rewindButton.setAttribute("id", `rewind${i}`);
      rewindButton.innerHTML = "Rewind";
      audioControls.append(playButton, skipButton, rewindButton);
      article.append(title, description, pubDate, author, audioControls);
      // article.append(title, description, pubDate, author);
      page.append(article);
    }
    episodeAudio(rssFeed);
  }
  
  
  
  function displayFeed() {
    rssFeedData().then((rssFeed) => {
      individualEpisodeCard(rssFeed);
    })

    // let goose = rssFeedData();
    // individualEpisodeCard(goose);
  }
  
  
  let playstate = false;
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
    audioSourceNumber.currentTime += 15;
  }
  function rewindAudio(num) {
    let source = "episodeAudio" + num;
    let audioSourceNumber = document.getElementById(source);
    audioSourceNumber.currentTime -= 15;
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
      if (e.target.id.includes('play')) {
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
//   getSpecificAudio();
  