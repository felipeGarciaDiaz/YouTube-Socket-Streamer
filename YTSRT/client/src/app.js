var socket = io();

socket.on("video", function (video) {
    var justID = video.replace("https://www.youtube.com/watch?v=", "");
    player = new YT.Player("player", {
        height: "390",
        width: "640",
        videoId: justID,
        playerVars: {
            disablekb: 1,
        },
        events: {
            onStateChange: onPlayerStateChange,
        },
    });
});
var onYouTubeIframeAPIReady = function () {
    player;
};
var vChangeState = function (request, approve, command) {
    socket.emit(request);
    socket.on(approve, function () {
        if (command === "play") player.playVideo();
        else player.pauseVideo();
    });
};
var vSeek = function () {
    socket.emit("seekRequest", player.getCurrentTime());
    socket.on("seekApprove", function (videoTimeData) {
        player.seekTo(videoTimeData);
        console.log(videoTimeData);
    });
};
var onPlayerStateChange = function (e) {
    if (e.data === 2 /* PAUSED */) {
        console.log("video state: " + player.getPlayerState());
        vChangeState("pauseRequest", "pauseApprove", "pause");
        vSeek();
    } else if (e.data === 1 /* PLAYING */) {
        console.log("video state: " + player.getPlayerState());
        vChangeState("playRequest", "playApprove", "play");
    }
};
window.onload = function () {
    vChangeState("playRequest", "playApprove", "play");
    vChangeState("pauseRequest", "pauseApprove", "pause");
};
