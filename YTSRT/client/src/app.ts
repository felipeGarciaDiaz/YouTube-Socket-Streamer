const socket: any = io();
declare var player: any;

socket.on("video", (video: string): void => {
    
    const justID: string = video.replace("https://www.youtube.com/watch?v=", "");

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

let onYouTubeIframeAPIReady = (): void => {
    player;
};

let vChangeState = (request: string, approve: string, command: string): void => {
    
    socket.emit(request);
    socket.on(approve, (): void => {
        if (command === "play") player.playVideo();
        else player.pauseVideo();
    });
};

let vSeek = (): void => {
    
    socket.emit("seekRequest", player.getCurrentTime());
    socket.on("seekApprove", (videoTimeData: number): void => {
        player.seekTo(videoTimeData);
        console.log(videoTimeData);
    });
};
let onPlayerStateChange = (e: any): void => {
    if (e.data === YT.PlayerState.PAUSED) {
        
        console.log("video state: " + player.getPlayerState());
        vChangeState("pauseRequest", "pauseApprove", "pause");
        vSeek();
        
    } else if (e.data === YT.PlayerState.PLAYING) {
        
        console.log("video state: " + player.getPlayerState());
        vChangeState("playRequest", "playApprove", "play");
    }
};

window.onload = (): void => {
    
    vChangeState("playRequest", "playApprove", "play");
    vChangeState("pauseRequest", "pauseApprove", "pause");
};
