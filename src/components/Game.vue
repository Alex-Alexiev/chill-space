<template>
  <div>
    <!-- The Modal -->
    <div id="myModal" class="modal">
      <!-- Modal content -->
      <div class="modal-content">
        <p>Loading video...</p>
      </div>
    </div>
    <div>
      <br />
      <br />
      <center><h2>Your Room </h2>
      <h4 class="text-muted">Code: {{message.roomId}}</h4></center>
      <div id="canvas-div" style="text-align: center">
        <canvas
          ref="canvas"
          class="top"
          id="2d"
          v-bind:width="windowWidth - 30"
          height="500"
          style="
            background-color: white;
            border-style: solid;
            border-width: 0.5px;
            border-radius: 15px;
            height: 50%;
            background: url('https://i.ibb.co/X3sHrcM/Pngtree-summer-sandy-beach-background-986369.png');
          ">
          </canvas>
      </div>
      <center>
        <div class="container">
          <div class="row">
            <div class="col">
              <div class="card" style="width: 18rem">
                <div class="card-body">
                  <h5 class="card-title">Your Camera</h5>
                  <h6 class="card-subtitle mb-2 text-muted">
                    (Only you can see this)
                  </h6>
                  <div class="card-text">
                    <div id="video" style="display: inline-block; width: 100%">
                      <video
                        ref="video"
                        autoplay
                        class="top"
                        style="display: inline-block; height: 100%; width: 100%"
                      ></video>
                    </div>
                  </div>
                </div>
              </div>
            </div>
           
            <div class="col">
               <div class="card" style="width: 18rem">
              <div class="card-body">
                <h5 class="card-title">Settings:</h5>
                <h6 class="card-subtitle mb-2 text-muted">Edit your player:</h6>
                <div class="card-text">
                  <label for="customRange3" class="form-label"><b>Colour</b></label>
                  <input
                    type="range"
                    class="form-range"
                    min="1"
                    max="8"
                    step="1"
                    v-model="colorSelect"
                    @change="updateColor"
                    id="customRange3"
                    style="width: 100%;"
                  />
                  <br />
                  <input
                    type="text"
                    v-model="username"
                    placeholder="Enter a username"
                    @change="updateUsername"
                  />
                  <br />
                  Color: {{ colorSelect }}
                  <br />
                  Username: {{ username }}
                  <br />
                  Video Loaded: {{ videoLoaded }}
                  <br>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </center>

      <br />
    </div>
  </div>
</template>

<script>
import * as posenet from "@tensorflow-models/posenet";
import * as utils from "../utils";
import { useWindowSize } from "vue-window-size";

export default {
  setup() {
    const { width, height } = useWindowSize();
    return {
      windowWidth: width,
      windowHeight: height,
    };
  },
  data() {
    return {
      connection: null,
      message: {},
      people: {},
      resultWidth: 0,
      resultHeight: 0,
      colorSelect: 1,
      username: "",
      videoLoaded: false,
      windowWidth: window.innerWidth,
      modal: {},
      span: {},
    };
  },
  created() {
    console.log("Starting connection to websocket server");
    //console.log(this.$route.params.id);
    this.connection = new WebSocket("wss://dance.cubehostingmc.com:4000/");

    this.connection.onopen = (event) => {
      console.log(event);
      console.log("Successfully connected to the echo WebSocket Server");
    };
  },
  async mounted() {
    this.modal = document.getElementById("myModal");
    this.span = document.getElementsByClassName("close")[0];

    this.modal.style.display = "block";
    window.addEventListener("resize", () => {
      this.windowWidth = window.innerWidth;
    });
    this.ctx = this.$refs.canvas.getContext("2d");
    this.net = await posenet.load({
      architecture: "ResNet50",
      outputStride: 32,
      inputResolution: 250,
      multiplier: 1,
      quantBytes: 2,
    });
    this.streamPromise = await this.initWebcamStream();
    this.connection.onmessage = (event) => {
      let data = JSON.parse(event.data);
      this.game = data.game;
      this.playerArr = data.playerArr; // When we recieve a message
      //utils.assignAllUniversePairs(this.playerArr, this.ctx)
      //let players = this.playerArr;
      let numPlayers = this.playerArr.length;
      let width = this.ctx.canvas.width;
      let x_spacing = width / (numPlayers + 1);
      for (let i = 0; i < numPlayers; i++) {
          let x = (i + 1) * x_spacing;
          let y = this.ctx.canvas.height / 2;
          let com = utils.getCenterOfMass(this.playerArr[i].pose.keypoints);
          this.playerArr[i].universePairs = utils.keypointsToUniverse(this.playerArr[i].pose.keypoints, com, [x, y])
          this.playerArr[i].pose.keypoints.forEach(keypoint => {
              if (keypoint.part == "nose") {
                  this.playerArr[i].head = utils.getUniversePoint(keypoint, com, [x, y])
              }
          })
      }
      this.message.playerArr = this.playerArr;
    };
    this.gameCycle();
  },
  methods: {
    sendMessage() {
      //console.log(this.connection);
      this.message.playerId = this.getCookie("playerId");
      this.message.gameId = this.$route.params.id;
      this.message.colour = this.getCookie("playerColour");
      this.message.name = this.username;
      if (!this.message.game) {
        this.message.game = {};
      }
      utils.assignAllUniversePairs(this.message.playerArr, this.ctx)
      //this.message.playerArr = this.playerArr;
      this.message.game.name = this.getCookie("game");
      //console.log(this.message);
      let str = JSON.stringify(this.message);
    
      this.connection.send(str);
      
    },
    getCookie(cname) {
      var name = cname + "=";
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(";");
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    },
    initWebcamStream() {
      // if the browser supports mediaDevices.getUserMedia API
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return navigator.mediaDevices
          .getUserMedia({
            audio: false, // don't capture audio
            video: { facingMode: "user" }, // use the rear camera if there is
          })
          .then((stream) => {
            // set <video> source as the webcam input
            let video = this.$refs.video;
            try {
              video.srcObject = stream;
            } catch (error) {
              // support older browsers
              video.src = URL.createObjectURL(stream);
            }
            return new Promise((resolve) => {
              // when video is loaded
              video.onloadedmetadata = () => {
                this.videoLoaded = true;
                this.modal.style.display = "none";
                // calculate the video ratio
                this.videoRatio = video.offsetHeight / video.offsetWidth;
                // add event listener on resize to reset the <video> and <canvas> sizes
                window.addEventListener("resize", this.setResultSize);
                // set the initial size
                this.setResultSize();
                resolve();
              };
            });
          })
          .catch((error) => {
            console.log("failed to initialize webcam stream", error);
            throw error;
          });
      } else {
        return Promise.reject(
          new Error(
            "Your browser does not support mediaDevices.getUserMedia API"
          )
        );
      }
    },
    setResultSize() {
      // get the current browser window size
      let clientWidth = document.documentElement.clientWidth;
      // set max width as 600
      this.resultWidth = Math.min(600, clientWidth);
      // set the height according to the video ratio
      this.resultHeight = this.resultWidth * this.videoRatio;
      // set <video> width and height
      /*
        Doesn't use vue binding :width and :height,
          because the initial value of resultWidth and resultHeight
          will affect the ratio got from the initWebcamStream()
      */
      let video = this.$refs.video;
      video.width = this.resultWidth;
      video.height = this.resultHeight;
    },
    timeout(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    async detectPose() {
      const imageScaleFactor = 0.5;
      const flipHorizontal = true;
      const outputStride = 16;
      this.pose = await this.net.estimateSinglePose(
        this.$refs.video,
        imageScaleFactor,
        flipHorizontal,
        outputStride
      );

      let playerId = this.getCookie("playerId");
      let roomId = this.$route.params.id;
      let send = {
        roomId: roomId,
        playerArr: [{ playerId: playerId, pose: this.pose }],
      };   
      this.message = send;
      this.sendMessage();
    },
    updateColor() {
      this.setCookie("playerColour", this.colorSelect, 1);
    },
    updateUsername() {
      this.setCookie("playerUsername", this.username, 1);
    },
    setCookie(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      var expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },
    draw() {
      utils.clearCanvas(this.ctx);
      if (this.playerArr) {
        utils.drawPlayers(this.playerArr, this.ctx);
      }

      if (this.game != undefined) {
        utils.drawGame(this.game, this.ctx);
      }
    },
    async gameCycle() {
      this.draw();
      this.detectPose();
       await this.timeout(100);
      return this.gameCycle();
      //requestAnimationFrame(() => {
      //    this.gameCycle();
      //})
    },
    getColour(colourSelect){
      const colours = {0: "red", 1: "green", 2:"blue", 3:"orange", 4:"purple", 5:"pink", 6:"black", 7:"brown", 8:"aqua"}
      return colours[colourSelect];
    },
  },
};
</script>

<style scoped>

.modal {
  display: none; 
  position: fixed; 
  z-index: 1; 
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto; 
  padding: 20px;
  border: 1px solid #888;
  width: 25%; 
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style>