declare var video_link: string;

//loads up all dependencies
const express: any = require("express");
const app: any = express();
const http: any = require("http").createServer(app);
const ioS: any = require("socket.io")(http);
const readline: any = require("readline");

//Sets the port.
const PORT: number = 8080;

//Creates the data needed to ask for the youtube link
const ytVideo: any = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

//creates a prompt requesting for the link to the desired video
ytVideo.question("Please put in the video link here: ", (link: string): void => {
    video_link = link;
    ytVideo.close();
});

//runs when prompt is submitted
ytVideo.on("close", (): void => {
    
    console.log("please go to to your server to view the video");
    
    //loads up the index.html file in the client folder
    app.use("/", express.static(__dirname + "../client/"));

    //checks for a connection to the server
    ioS.on("connection", (socket: any): void => {
        
        //emits the video data
        socket.emit("video", video_link);
        
        //function that checks if a request is sent and sends back an approval
        let updateStateHandler = (request: string, approval: string): void => {
            
            socket.on(request, (data: string): void => {
                ioS.emit(approval, data);
            });
            
        };
        
        //sets the PLAY, SEEK, and PAUSED parameters via the server
        updateStateHandler("playRequest", "playApprove");
        updateStateHandler("pauseRequest", "pauseApprove");
        updateStateHandler("seekRequest", "seekApprove");
        
    });

    //creates the server
    http.listen(PORT, () => {
        console.log("server started using port: " + PORT);
    });
});
