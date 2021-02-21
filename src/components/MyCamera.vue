<template>
<div id="my-camera">
    <div class="resultFrame">
      <video ref="video" autoplay></video>
      <canvas ref="canvas" :width="resultWidth" :height="resultHeight"></canvas>
    </div>
  </div>
</template>

<script>
import * as posenet from "@tensorflow-models/posenet";
import * as utils from "../utils";

export default {
  name: 'app',
  data () {
    return {
      // store the promises of initialization
      streamPromise: null,
      // control the UI visibilities
      isVideoStreamReady: false,
      isModelReady: false,
      initFailMessage: '',
      pose: [],
      resultHeight: 0, 
      resultWidth: 0
    }
  },
  methods: {
    initWebcamStream () {
      // if the browser supports mediaDevices.getUserMedia API
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return navigator.mediaDevices.getUserMedia({
          audio: false, // don't capture audio
          video: { facingMode: 'environment' } // use the rear camera if there is
        })
          .then(stream => {
            // set <video> source as the webcam input
            let video = this.$refs.video
            try {
              video.srcObject = stream
            } catch (error) {
              // support older browsers
              video.src = URL.createObjectURL(stream)
            }
            return new Promise((resolve) => {
              // when video is loaded
              video.onloadedmetadata = () => {
                // calculate the video ratio
                this.videoRatio = video.offsetHeight / video.offsetWidth
                // add event listener on resize to reset the <video> and <canvas> sizes
                window.addEventListener('resize', this.setResultSize)
                // set the initial size
                this.setResultSize()
                this.isVideoStreamReady = true
                console.log('webcam stream initialized')
                resolve()
              }
            })
          })
          .catch(error => {
            console.log('failed to initialize webcam stream', error)
            throw (error)
          })
      } else {
        return Promise.reject(new Error('Your browser does not support mediaDevices.getUserMedia API'))
      }
    },
    setResultSize () {
      // get the current browser window size
      let clientWidth = document.documentElement.clientWidth
      // set max width as 600
      this.resultWidth = Math.min(600, clientWidth)
      // set the height according to the video ratio
      this.resultHeight = this.resultWidth * this.videoRatio
      // set <video> width and height
      /*
        Doesn't use vue binding :width and :height,
          because the initial value of resultWidth and resultHeight
          will affect the ratio got from the initWebcamStream()
      */
      let video = this.$refs.video
      video.width = this.resultWidth
      video.height = this.resultHeight
    },
    timeout(ms){
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    async detectPose() {
        const imageScaleFactor = 0.5;
        const flipHorizontal = true;
        const outputStride = 16;
        this.pose = await this.net.estimateSinglePose(this.$refs.video, imageScaleFactor, flipHorizontal, outputStride) 
        console.log(this.pose);
        utils.drawSkeleton(this.pose.keypoints, 0.3, this.ctx);
        //this.renderPose();
        // await this.timeout(1000/20);
        // return this.detectPose();
        requestAnimationFrame(() => {
            this.detectPose();
        })
    }
  },
  async mounted () {
    this.ctx = this.$refs.canvas.getContext("2d");
    this.net = await posenet.load();
    this.streamPromise = await this.initWebcamStream()
    this.detectPose();
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
}
.resultFrame {
  display: grid;
  video {
    grid-area: 1 / 1 / 2 / 2;
  }
  canvas {
    grid-area: 1 / 1 / 2 / 2;
  }
}
</style>