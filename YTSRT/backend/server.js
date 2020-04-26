var express = require("express");
var app = express();
var http = require("http").createServer(app);
var ioS = require("socket.io")(http);
var readline = require("readline");
var PORT = 42553;
var ytVideo = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
ytVideo.question("Please put in the video link here: ", function (link) {
    video_link = link;
    ytVideo.close();
});
ytVideo.on("close", function () {
    console.log("please go to to youre server to view the video");
    app.use("/", express.static(__dirname + "/../client/"));
    ioS.on("connection", function (socket) {
        socket.emit("video", video_link);
        var updateStateHandler = function (request, approval) {
            socket.on(request, function (data) {
                ioS.emit(approval, data);
            });
        };
        updateStateHandler("playRequest", "playApprove");
        updateStateHandler("pauseRequest", "pauseApprove");
        updateStateHandler("seekRequest", "seekApprove");
    });
    http.listen(PORT, function () {
        console.log("server started using port: " + PORT);
    });
});
