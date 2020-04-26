declare var video_link: string;

const express: any = require("express");
const app: any = express();
const http: any = require("http").createServer(app);
const ioS: any = require("socket.io")(http);

const readline: any = require("readline");
const PORT: number = 42553;
const ytVideo: any = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

ytVideo.question("Please put in the video link here: ", (link: string): void => {
    video_link = link;
    ytVideo.close();
});
ytVideo.on("close", (): void => {
    console.log("please go to to youre server to view the video");

    app.use("/", express.static(__dirname + "../client/"));

    ioS.on("connection", (socket: any): void => {
        socket.emit("video", video_link);

        let updateStateHandler = (request: string, approval: string): void => {
            socket.on(request, (data: string): void => {
                ioS.emit(approval, data);
            });
        };
        updateStateHandler("playRequest", "playApprove");
        updateStateHandler("pauseRequest", "pauseApprove");
        updateStateHandler("seekRequest", "seekApprove");
    });

    http.listen(PORT, () => {
        console.log("server started using port: " + PORT);
    });
});
