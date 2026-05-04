let player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        videoId: 'Q_yKC8D6H50'
    });
}

function jumpTo(minutes, seconds) {
    totalSeconds = (minutes * 60) + seconds;
    player.seekTo(totalSeconds, true);
    player.playVideo();
}