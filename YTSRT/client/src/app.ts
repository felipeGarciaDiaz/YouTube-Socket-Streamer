const socket: any = io();
declare var player: any;

//When the server decides what youtube video to watch, the socket will be emitted creating the desired youtube video, and initializing the player.
socket.on("video", (video: string): void => {
    
    //Breaks the string down to just the youtube video ID so the player can create the video
    const justID: string = video.replace("https://www.youtube.com/watch?v=", "");

    //Creates the player, creates the size of the video, the justID is the id of the video.
    player = new YT.Player("player", {
        height: "390",
        width: "640",
        videoId: justID,
        playerVars: {
            disablekb: 1,
        },
        events: { //Updates when the player is PAUSED ir PLAYING
            onStateChange: onPlayerStateChange,
        },
    });
    
});

//Runs the player initializer
let onYouTubeIframeAPIReady = (): void => {
    player;
};

//Checks if the video state changes and updates it via sockets, sends a request to the server and waits for an approval.
//additionally added the command parameter incase someone wanted to add an extra feature. 
let vChangeState = (request: string, approve: string, command: string): void => {
    
    socket.emit(request);
    socket.on(approve, (): void => {
        if (command === "play") player.playVideo();
        else player.pauseVideo();
    });
};

//Plays when a user skips to a later or earlier part in the video, will emit a socket that updates all watchers, and localizes the video time
let vSeek = (): void => {
    
    socket.emit("seekRequest", player.getCurrentTime());
    socket.on("seekApprove", (videoTimeData: number): void => {
        player.seekTo(videoTimeData);
        console.log(videoTimeData);
    });
};

//Checks if the player changes to PAUSED, or PLAYING and sends a socket to the server to update this information
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

//Initializes the play and pause so the server can start to understand, and ensures everyone starts out at the same point.
window.onload = (): void => {
    
    vChangeState("playRequest", "playApprove", "play");
    vChangeState("pauseRequest", "pauseApprove", "pause");
};
