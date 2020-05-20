/*!

=========================================================
* Argon Dashboard React - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
// node.js library that concatenates classes (strings)
import * as bodyPix from "@tensorflow-models/body-pix";
//import dat from "dat.gui";
import Stats from "stats.js";
import * as partColorScales from "../part_color_scales";

//import * as partColorScales from "./part_color_scales";
import classnames from "classnames";
// javascipt plugin for creating charts
import Chart from "chart.js";
// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  NavItem,
  NavLink,
  Nav,
  Progress,
  Table,
  Container,
  Row,
  Col
} from "reactstrap";

// core components
import {
  chartOptions,
  parseOptions,
  chartExample1,
  chartExample2
} from "variables/charts.jsx";

import Header from "components/Headers/Header.jsx";

const stats = new Stats();

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isMobile() {
  return isAndroid() || isiOS();
}

const guiState = {
  estimate: "partmap",
  camera: null,
  flipHorizontal: true,
  input: {
    mobileNetArchitecture: isMobile() ? "0.50" : "0.75",
    outputStride: 16
  },
  segmentation: {
    segmentationThreshold: 0.5,
    effect: "mask",
    maskBackground: true,
    opacity: 0.7,
    backgroundBlurAmount: 3,
    maskBlurAmount: 0,
    edgeBlurAmount: 3
  },
  partMap: {
    colorScale: "rainbow",
    segmentationThreshold: 0.5,
    applyPixelation: false,
    opacity: 0.9
  },
  showFps: !isMobile()
};

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      video: null,
      stream: null,
      net: null,
      videoConstraints: {},
      changingCamera: false,
      changingArchitecture: false
    };

    this.isAndroid = this.isAndroid.bind(this);
    this.isiOS = this.isiOS.bind(this);
    this.isMobile = this.isMobile.bind(this);
    this.getVideoInputs = this.getVideoInputs.bind(this);

    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    // kick off the demo
    this.bindPage();
  }

  isAndroid() {
    return /Android/i.test(navigator.userAgent);
  }

  isiOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  isMobile() {
    return this.isAndroid() || this.isiOS();
  }

  getVideoInputs = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log("enumerateDevices() not supported.");
      return [];
    }

    const devices = await navigator.mediaDevices.enumerateDevices();

    const videoDevices = devices.filter(device => device.kind === "videoinput");

    return videoDevices;
  };

  stopExistingVideoCapture() {
    //debugger;
    if (this.state.video && this.state.video.srcObject) {
      this.state.video.srcObject.getTracks().forEach(track => {
        track.stop();
      });
      this.state.video.srcObject = null;
    }
  }
  getConstraints = async cameraLabel => {
    console.log("5");
    //debugger;

    let deviceId;
    let facingMode;

    if (cameraLabel) {
      deviceId = await this.getDeviceIdForLabel(cameraLabel);
      // on mobile, use the facing mode based on the camera.
      //facingMode = isMobile() ? this.getFacingMode(cameraLabel) : null;
    }
    return { deviceId, facingMode };
  };
  getDeviceIdForLabel = async cameraLabel => {
    //debugger;

    const videoInputs = await this.getVideoInputs();

    for (let i = 0; i < videoInputs.length; i++) {
      const videoInput = videoInputs[i];
      if (videoInput.label === cameraLabel) {
        return videoInput.deviceId;
      }
    }

    return null;
  };

  getDeviceIdForLabel = async cameraLabel => {
    //debugger;

    const videoInputs = await this.getVideoInputs();

    for (let i = 0; i < videoInputs.length; i++) {
      const videoInput = videoInputs[i];
      if (videoInput.label === cameraLabel) {
        return videoInput.deviceId;
      }
    }

    return null;
  };

  // getFacingMode(cameraLabel) {
  //   //debugger;

  //   console.log("facing mode", cameraLabel);
  //   if (!cameraLabel) {
  //     return "user";
  //   }
  //   if (cameraLabel.toLowerCase().includes("back")) {
  //     return "environment";
  //   } else {
  //     return "user";
  //   }
  // }

  setupCamera = async cameraLabel => {
    //debugger;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        "Browser API navigator.mediaDevices.getUserMedia not available"
      );
    }

    const videoElement = document.getElementById("video");

    this.stopExistingVideoCapture();

    const videoConstraints = await this.getConstraints(cameraLabel);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: videoConstraints
    });
    videoElement.srcObject = stream;

    return new Promise(resolve => {
      videoElement.onloadedmetadata = () => {
        videoElement.width = videoElement.videoWidth;
        videoElement.height = videoElement.videoHeight;
        resolve(videoElement);
      };
    });
  };

  loadVideo = async cameraLabel => {
    //debugger;

    try {
      this.state.video = await this.setupCamera(cameraLabel);
    } catch (e) {
      let info = document.getElementById("info");
      info.textContent =
        "this browser does not support video capture," +
        "or this device does not have a camera";
      info.style.display = "block";
      throw e;
    }

    this.state.video.play();
  };

  toCameraOptions(cameras) {
    //debugger;

    const result = { default: null };

    cameras.forEach(camera => {
      result[camera.label] = camera.label;
    });

    return result;
  }

  setupFPS() {
    //debugger;

    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    if (guiState.showFps) {
      document.body.appendChild(stats.dom);
    }
  }

  segmentBodyInRealTime() {
    //debugger;
    var left = "false";
    var right = "false";
    var center = "false";

    const canvas = document.getElementById("output");
    // since images are being fed from a webcam

    this.bodySegmentationFrame = async () => {
      // if changing the model or the camera, wait a second for it to complete
      // then try again.
      if (this.state.changingArchitecture || this.state.changingCamera) {
        setTimeout(this.bodySegmentationFrame, 1000);
        return;
      }

      // Begin monitoring code for frames per second
      stats.begin();

      // Scale an image down to a certain factor. Too large of an image will
      // slow down the GPU
      const outputStride = +guiState.input.outputStride;

      const flipHorizontally = guiState.flipHorizontal;

      switch (guiState.estimate) {
        case "segmentation":
          const personSegmentation = await this.state.net.estimatePersonSegmentation(
            this.state.video,
            outputStride,
            guiState.segmentation.segmentationThreshold
          );

          switch (guiState.segmentation.effect) {
            case "mask":
              const mask = bodyPix.toMaskImageData(
                personSegmentation,
                guiState.segmentation.maskBackground
              );
              bodyPix.drawMask(
                canvas,
                this.state.video,
                mask,
                guiState.segmentation.opacity,
                guiState.segmentation.maskBlurAmount,
                flipHorizontally
              );

              break;
            case "bokeh":
              bodyPix.drawBokehEffect(
                canvas,
                this.state.video,
                personSegmentation,
                +guiState.segmentation.backgroundBlurAmount,
                guiState.segmentation.edgeBlurAmount,
                flipHorizontally
              );
              break;
          }
          break;
        case "partmap":
          const partSegmentation = await this.state.net.estimatePartSegmentation(
            this.state.video,
            outputStride,
            guiState.partMap.segmentationThreshold
          );

          //console.log("points", partSegmentation.data);
          const values = Object.values(partSegmentation.data);

          var x = values.filter(pt => pt != -1).length;
          var y = values.filter(pt => pt === 0).length;
          var z = values.filter(pt => pt === 1).length;

          var q = ((y + z) * 100) / x;
          var p = (y * 100) / x;
          var r = (z * 100) / x;

          if (q > 50) {
            document.getElementById("faceCover").style.display = "none";
            if (center == "false") {
              document.getElementById("centerface").style.display = "block";
            } else if (left == "false") {
              document.getElementById("wayToLeft").style.display = "block";
              document.getElementById("centerface").style.display = "none";
            } else if (right == "false") {
              document.getElementById("wayToLeft").style.display = "none";
              document.getElementById("wayToRight").style.display = "block";
            } else {
              document.getElementById("allDone").style.display = "block";
            }
          } else {
            document.getElementById("faceCover").style.display = "block";
            document.getElementById("wayToLeft").style.display = "none";
          }

          if (q > 50 && p > 30 && r > 30 && center == "false") {
            this.capture("center");
            center = "true";
          } else if (p > 50 && left == "false") {
            left = "true";
            document.getElementById("wayToLeft").style.display = "none";
            this.capture("left");
          } else if (r > 50 && right == "false") {
            right = "true";
            this.capture("right");
            document.getElementById("wayToRight").style.display = "none";
          }

          const coloredPartImageData = bodyPix.toColoredPartImageData(
            partSegmentation,
            partColorScales[guiState.partMap.colorScale]
          );

          const maskBlurAmount = 0;
          if (guiState.partMap.applyPixelation) {
            const pixelCellWidth = 10.0;

            bodyPix.drawPixelatedMask(
              canvas,
              video,
              coloredPartImageData,
              guiState.partMap.opacity,
              maskBlurAmount,
              flipHorizontally,
              pixelCellWidth
            );
          } else {
            bodyPix.drawMask(
              canvas,
              video,
              coloredPartImageData,
              //guiState.opacity,
              //maskBlurAmount,
              flipHorizontally
            );
          }

          break;
        default:
          break;
      }

      // End monitoring code for frames per second
      stats.end();

      this.requestAnimationFrame(this.bodySegmentationFrame);
    };

    this.bodySegmentationFrame();
  }

  /**
   * Kicks off the demo.
   */
  //componentWillMount() {

  bindPage = async () => {
    console.log("12");
    //debugger;

    // Load the BodyPix model weights with architecture 0.75
    this.state.net = await bodyPix.load(+guiState.input.mobileNetArchitecture);

    document.getElementById("loading").style.display = "none";
    document.getElementById("main").style.display = "inline-block";

    await this.loadVideo();

    let cameras = await this.getVideoInputs();

    this.setupFPS();
    ////setupGui(cameras);

    this.segmentBodyInRealTime();
  };
  //}

  capture = value => {
    var canvas = document.getElementById(value);
    var video = document.getElementById("video");
    canvas.width = 250;
    canvas.height = 250;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    var dataURI = canvas.toDataURL("image/jpeg");
    console.log("leftimage", dataURI);
  };

  render() {
    return (
      <>
        <Header />
        {/* Page content */}
        <Container className="mt--7" fluid>
          <Row>
            <Col className="mb-5 mb-xl-0" xl="12">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <Row className="align-items-center">
                    <div className="col">
                      <h6 className="text-uppercase text-light ls-1 mb-1">
                        Overview
                      </h6>
                      <h2 className="text-white mb-0">Sales valueee</h2>
                    </div>
                  </Row>
                </CardHeader>
                <CardBody>
                  {/* Chart */}
                  test
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    );
  }
}

export default Index;

// -------------

import React from "react";
import * as bodyPix from "@tensorflow-models/body-pix";
import Stats from "stats.js";
import * as partColorScales from "../part_color_scales";
import { Card, CardHeader, CardBody, Container, Row, Col } from "reactstrap";
import Header from "components/Headers/Header.jsx";
//import axios from "axios";

const hide = {
  display: "none"
};

const stats = new Stats();

const state = {
  video: null,
  stream: null,
  net: null,
  videoConstraints: {},
  changingCamera: false,
  changingArchitecture: false
};

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isMobile() {
  return isAndroid() || isiOS();
}

async function getVideoInputs() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    return [];
  }

  const devices = await navigator.mediaDevices.enumerateDevices();

  const videoDevices = devices.filter(device => device.kind === "videoinput");

  return videoDevices;
}

function stopExistingVideoCapture() {
  if (state.video && state.video.srcObject) {
    state.video.srcObject.getTracks().forEach(track => {
      track.stop();
    });
    state.video.srcObject = null;
  }
}

async function getConstraints(cameraLabel) {
  let deviceId;
  let facingMode;

  if (cameraLabel) {
    deviceId = await getDeviceIdForLabel(cameraLabel);
    // on mobile, use the facing mode based on the camera.
    facingMode = isMobile() ? getFacingMode(cameraLabel) : null;
  }
  return { deviceId, facingMode };
}
async function getDeviceIdForLabel(cameraLabel) {
  const videoInputs = await getVideoInputs();

  for (let i = 0; i < videoInputs.length; i++) {
    const videoInput = videoInputs[i];
    if (videoInput.label === cameraLabel) {
      return videoInput.deviceId;
    }
  }

  return null;
}

// function getFacingMode(cameraLabel) {
//   if (!cameraLabel) {
//     return "user";
//   }
//   if (cameraLabel.toLowerCase().includes("back")) {
//     return "environment";
//   } else {
//     return "user";
//   }
// }

async function setupCamera(cameraLabel) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      "Browser API navigator.mediaDevices.getUserMedia not available"
    );
  }

  const videoElement = document.getElementById("video");

  stopExistingVideoCapture();

  const videoConstraints = await getConstraints(cameraLabel);

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: videoConstraints
  });
  videoElement.srcObject = stream;

  return new Promise(resolve => {
    videoElement.onloadedmetadata = () => {
      videoElement.width = videoElement.videoWidth;
      videoElement.height = videoElement.videoHeight;
      resolve(videoElement);
    };
  });
}

async function loadVideo(cameraLabel) {
  try {
    state.video = await setupCamera(cameraLabel);
  } catch (e) {
    let info = document.getElementById("info");
    info.textContent =
      "this browser does not support video capture," +
      "or this device does not have a camera";
    info.style.display = "block";
    throw e;
  }

  state.video.play();
}

const guiState = {
  camera: null,
  flipHorizontal: true,
  input: {
    mobileNetArchitecture: isMobile() ? "0.50" : "0.75",
    outputStride: 16
  },
  partMap: {
    colorScale: "rainbow",
    segmentationThreshold: 0.5
  }
};

function segmentBodyInRealTime() {
  //var left = "false";
  var l1 = "false";
  var l2 = "false";
  var l3 = "false";
  var r1 = "false";
  var r2 = "false";
  var r3 = "false";
  //var right = "false";
  var center = "false";
  const canvas = document.getElementById("output");

  var seq = ["0", "1", "0", "1", "2", "0"];
  var a = 0;
  // since images are being fed from a webcam

  async function bodySegmentationFrame() {
    // if changing the model or the camera, wait a second for it to complete
    // then try again.
    if (state.changingArchitecture || state.changingCamera) {
      setTimeout(bodySegmentationFrame, 1000);
      return;
    }

    // Begin monitoring code for frames per second
    stats.begin();

    // Scale an image down to a certain factor. Too large of an image will
    // slow down the GPU
    const outputStride = +guiState.input.outputStride;

    const flipHorizontally = guiState.flipHorizontal;

    const partSegmentation = await state.net.estimatePartSegmentation(
      state.video,
      outputStride,
      guiState.partMap.segmentationThreshold
    );

    const values = Object.values(partSegmentation.data);

    var total = values.filter(pt => pt != -1).length;
    var leftPoints = values.filter(pt => pt === 0).length;
    var rightPoints = values.filter(pt => pt === 1).length;

    var face = ((leftPoints + rightPoints) * 100) / total;
    var leftFace = (leftPoints * 100) / total;
    var rightFace = (rightPoints * 100) / total;

    function getLeftFace() {
      if (leftFace > 25 && leftFace < 30) {
        //capture("left");
        l1 = "true";
      }
      if (leftFace > 30 && leftFace < 35) {
        //capture("left");
        l2 = "true";
      }
      if (leftFace > 35 && leftFace < 40) {
        //capture("left");
        l3 = "true";
      }
      if (leftFace > 40 && l1 == "true" && l2 == "true" && l3 == "true") {
        capture("left");
        a++;
        document.getElementById("wayToLeft").style.display = "none";
      }
      // if (leftFace > 40) {
      //   a++;
      //   //leftVal = 1;
      //   console.log("Left Completed");
      //   document.getElementById("wayToLeft").style.display = "none";
      //   //alert("left");
      // }
    }
    function getRightFace() {
      if (rightFace > 25 && rightFace < 30) {
        //capture("right");
        r1 = "true";
      }
      if (rightFace > 30 && rightFace < 35) {
        //capture("right");
        r2 = "true";
      }
      if (rightFace > 35 && rightFace < 40) {
        //capture("right");
        r3 = "true";
      }
      if (rightFace > 40 && r1 == "true" && r2 == "true" && r3 == "true") {
        capture("right");
        a++;

        document.getElementById("wayToRight").style.display = "none";
      }
      // if (rightFace > 40) {
      //   a++;
      //   //rightVal = 1;
      //   //alert("right");
      //   console.log(rightFace);
      //   console.log("Right Completed");
      //   document.getElementById("wayToRight").style.display = "none";
      // }
    }
    function getCenterFace() {
      if (face > 40 && leftFace > 25 && rightFace > 25 && center == "false") {
        capture("center");
        a++;
        document.getElementById("centerface").style.display = "none";
      }
      // if (rightFace > 20 && leftFace > 20) {
      //   a++;
      //   //centerVal = 1;
      //   //alert("center");
      //   console.log(rightFace);
      //   console.log("Center Completed");
      //   document.getElementById("centerface").style.display = "none";
      // }
    }

    for (var s = 0; s < seq.length; s++) {
      if (seq[a] == 0) {
        document.getElementById("wayToLeft").style.display = "block";
        getLeftFace();
      }
      if (seq[a] == 1) {
        document.getElementById("wayToRight").style.display = "block";
        getRightFace();
      }
      if (seq[a] == 2) {
        document.getElementById("centerface").style.display = "block";
        getCenterFace();
      }
      if (seq.length == [a]) {
        document.getElementById("main").style.display = "none";
      }
    }

    // if (face > 40) {
    //   document.getElementById("faceCover").style.display = "none";
    //   if (center == "false") {
    //     document.getElementById("centerface").style.display = "block";
    //   } else if (left == "false") {
    //     document.getElementById("wayToLeft").style.display = "block";
    //     document.getElementById("centerface").style.display = "none";
    //   } else if (right == "false") {
    //     document.getElementById("wayToLeft").style.display = "none";
    //     document.getElementById("wayToRight").style.display = "block";
    //   } else {
    //     document.getElementById("allDone").style.display = "block";
    //     document.getElementById("wayToRight").style.display = "none";
    //   }
    // } else {
    //   document.getElementById("faceCover").style.display = "block";
    //   document.getElementById("wayToLeft").style.display = "none";
    // }

    // if (face > 40 && leftFace > 25 && rightFace > 25 && center == "false") {
    //   capture("center");
    //   center = "true";
    // } else if (leftFace > 25 && left == "false" && center == "true") {
    //   if (leftFace > 25 && leftFace < 30) {
    //     //capture("left");
    //     l1 = "true";
    //   }
    //   if (leftFace > 30 && leftFace < 35) {
    //     //capture("left");
    //     l2 = "true";
    //   }
    //   if (leftFace > 35 && leftFace < 40) {
    //     //capture("left");
    //     l3 = "true";
    //   }
    //   if (leftFace > 40 && l1 == "true" && l2 == "true" && l3 == "true") {
    //     capture("left");
    //     left = "true";
    //     //document.getElementById("wayToLeft").style.display = "none";
    //     //return false;
    //   }
    // } else if (
    //   rightFace > 25 &&
    //   right == "false" &&
    //   left == "true" &&
    //   center == "true"
    // ) {
    //   if (rightFace > 25 && rightFace < 30) {
    //     //capture("right");
    //     r1 = "true";
    //   }
    //   if (rightFace > 30 && rightFace < 35) {
    //     //capture("right");
    //     r2 = "true";
    //   }
    //   if (rightFace > 35 && rightFace < 40) {
    //     //capture("right");
    //     r3 = "true";
    //   }
    //   if (rightFace > 40 && r1 == "true" && r2 == "true" && r3 == "true") {
    //     right = "true";
    //     capture("right");

    //     document.getElementById("main").style.display = "none";
    //     //document.getElementById("wayToRight").style.display = "none";
    //   }
    // }

    const coloredPartImageData = bodyPix.toColoredPartImageData(
      partSegmentation,
      partColorScales[guiState.partMap.colorScale]
    );

    bodyPix.drawMask(
      canvas,
      state.video,
      coloredPartImageData,
      flipHorizontally
    );

    // End monitoring code for frames per second
    stats.end();

    requestAnimationFrame(bodySegmentationFrame);
  }

  bodySegmentationFrame();
}

export async function bindPage() {
  // Load the BodyPix model weights with architecture 0.75
  state.net = await bodyPix.load(+guiState.input.mobileNetArchitecture);

  document.getElementById("loading").style.display = "none";
  document.getElementById("main").style.display = "inline-block";

  await loadVideo();

  let cameras = await getVideoInputs();

  segmentBodyInRealTime();
}

function capture(value) {
  var canvas = document.getElementById(value);
  var video = document.getElementById("video");
  canvas.width = 200;
  canvas.height = 200;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  var dataURI = canvas.toDataURL("image/jpeg");

  window.helloComponent.sendImage(dataURI);
}

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      instruction: ""
    };
    window.helloComponent = this;
  }

  sendImage(value) {
    console.log("Called from outside", value);
    // axios.get(`https://jsonplaceholder.typicode.com/users`).then(res => {
    //   console.log(res);
    //   //const persons = res.data;
    //   //this.setState({ persons });
    // });
  }

  render() {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    // kick off the video
    bindPage();

    const instruction = this.state.instruction;
    return (
      <>
        <Header />
        {/* Page content */}
        <Container className="mt--7" fluid>
          <Row>
            <Col className="mb-5 mb-xl-0" xl="12">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <Row className="align-items-center">
                    <div className="col">
                      {instruction}
                      <div style={hide} id="faceCover">
                        Face should cover 40% of screen
                      </div>
                      <div style={hide} id="centerface">
                        Slowly move your head towards center
                      </div>
                      <div style={hide} id="wayToLeft">
                        Slowly move your head towards right
                      </div>
                      <div style={hide} id="wayToRight">
                        Slowly move your head towards left
                      </div>
                      <div style={hide} id="allDone">
                        All Done
                      </div>
                    </div>
                  </Row>
                </CardHeader>
                <CardBody>
                  <div>
                    <div id="stats" />
                    <div id="info" style={{ display: "none" }} />
                    <div id="loading">Loading the model...</div>

                    <Row>
                      <div
                        id="main"
                        className="col-md-7"
                        style={{ display: "none" }}
                      >
                        <video
                          id="video"
                          playsInline
                          style={{ width: "inherit" }}
                        />
                        <canvas id="output" style={hide} />
                      </div>
                      <div className="col-md-1" />
                      <div className="face-images col-md-4">
                        <canvas id="left" />
                        <canvas id="center" />
                        <canvas id="right" />
                      </div>
                    </Row>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    );
  }
}

export default Index;

// --------------------

import React from "react";
import * as bodyPix from "@tensorflow-models/body-pix";
import Stats from "stats.js";
import * as partColorScales from "../part_color_scales";
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "reactstrap";
import Header from "components/Headers/Header.jsx";
import axios from "axios";
import socketIOClient from "socket.io-client";
import GlobalConfig from "../config";

const socket = socketIOClient(GlobalConfig.backendURL);
const hide = {
  display: "none"
};

const screenshot = {
  width: "200px"
};

const randomId = Math.floor(Math.random() * 90000) + 10000;
const stats = new Stats();

const state = {
  video: null,
  stream: null,
  net: null,
  videoConstraints: {},
  changingCamera: false,
  changingArchitecture: false
};

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isMobile() {
  return isAndroid() || isiOS();
}

async function getVideoInputs() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    return [];
  }

  const devices = await navigator.mediaDevices.enumerateDevices();

  const videoDevices = devices.filter(device => device.kind === "videoinput");

  return videoDevices;
}

function stopExistingVideoCapture() {
  if (state.video && state.video.srcObject) {
    state.video.srcObject.getTracks().forEach(track => {
      track.stop();
    });
    state.video.srcObject = null;
  }
}

async function getConstraints(cameraLabel) {
  let deviceId;
  let facingMode;

  if (cameraLabel) {
    deviceId = await getDeviceIdForLabel(cameraLabel);
    facingMode = isMobile() ? getFacingMode(cameraLabel) : null;
  }
  return { deviceId, facingMode };
}
async function getDeviceIdForLabel(cameraLabel) {
  const videoInputs = await getVideoInputs();

  for (let i = 0; i < videoInputs.length; i++) {
    const videoInput = videoInputs[i];
    if (videoInput.label === cameraLabel) {
      return videoInput.deviceId;
    }
  }

  return null;
}

function getFacingMode(cameraLabel) {
  if (!cameraLabel) {
    return "user";
  }
  if (cameraLabel.toLowerCase().includes("back")) {
    return "environment";
  } else {
    return "user";
  }
}
var s1 = null;
async function setupCamera(cameraLabel) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      "Browser API navigator.mediaDevices.getUserMedia not available"
    );
  }

  const videoElement = document.getElementById("video");

  stopExistingVideoCapture();

  const videoConstraints = await getConstraints(cameraLabel);

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: videoConstraints
  });
  videoElement.srcObject = stream;
  s1 = stream;
  return new Promise(resolve => {
    videoElement.onloadedmetadata = () => {
      videoElement.width = videoElement.videoWidth;
      videoElement.height = videoElement.videoHeight;
      resolve(videoElement);
    };
  });
}

async function loadVideo(cameraLabel) {
  try {
    state.video = await setupCamera(cameraLabel);
  } catch (e) {
    let info = document.getElementById("info");
    info.textContent =
      "this browser does not support video capture," +
      "or this device does not have a camera";
    info.style.display = "block";
    throw e;
  }

  state.video.play();
}

const guiState = {
  camera: null,
  flipHorizontal: true,
  input: {
    mobileNetArchitecture: isMobile() ? "0.50" : "0.75",
    outputStride: 16
  },
  partMap: {
    colorScale: "rainbow",
    segmentationThreshold: 0.5
  }
};

function segmentBodyInRealTime() {
  function drawVideoFrame(time) {
    const canvas = document.getElementById("output");
    var video = document.getElementById("video");

    var CANVAS_WIDTH = canvas.width;
    var CANVAS_HEIGHT = canvas.height;
    var ctxv = canvas.getContext("2d");
    ctxv.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    var a = canvas.toDataURL("image/png", 1);
    var videoObject = {
      frame: a,
      personId: randomId.toString()
    };
    //console.log("ooooo", videoObject);
    socket.emit("frames", videoObject);
  }

  var l1 = "false";
  var l2 = "false";
  var l3 = "false";
  var r1 = "false";
  var r2 = "false";
  var r3 = "false";
  var center = "false";
  var complete = "false";
  const canvas = document.getElementById("output");

  var seq = ["0", "1", "0", "1", "2"];
  var a = 0;

  async function bodySegmentationFrame() {
    if (state.changingArchitecture || state.changingCamera) {
      setTimeout(bodySegmentationFrame, 1000);
      return;
    }

    stats.begin();
    const outputStride = +guiState.input.outputStride;

    const flipHorizontally = guiState.flipHorizontal;

    const partSegmentation = await state.net.estimatePartSegmentation(
      state.video,
      outputStride,
      guiState.partMap.segmentationThreshold
    );

    const values = Object.values(partSegmentation.data);

    var total = values.filter(pt => pt != -1).length;
    var leftPoints = values.filter(pt => pt === 0).length;
    var rightPoints = values.filter(pt => pt === 1).length;

    var face = ((leftPoints + rightPoints) * 100) / total;
    var leftFace = (leftPoints * 100) / total;
    var rightFace = (rightPoints * 100) / total;

    if (face < 40) {
      document.getElementById("faceCover").style.display = "block";
    } else {
      document.getElementById("faceCover").style.display = "none";
    }

    function getLeftFace() {
      //console.log("left", complete);
      if (leftFace > 25 && leftFace < 30) {
        l1 = "true";
      }
      if (leftFace > 30 && leftFace < 35) {
        l2 = "true";
      }
      if (leftFace > 35 && leftFace < 40) {
        l3 = "true";
      }
      if (
        leftFace > 40 &&
        l1 == "true" &&
        l2 == "true" &&
        l3 == "true" &&
        complete == "false"
      ) {
        capture("left");
        a++;
        document.getElementById("wayToLeft").style.display = "none";
      }
    }
    function getRightFace() {
      //console.log("right", complete);
      if (rightFace > 25 && rightFace < 30) {
        r1 = "true";
      }
      if (rightFace > 30 && rightFace < 35) {
        r2 = "true";
      }
      if (rightFace > 35 && rightFace < 40) {
        r3 = "true";
      }
      if (
        rightFace > 40 &&
        r1 == "true" &&
        r2 == "true" &&
        r3 == "true" &&
        complete == "false"
      ) {
        capture("right");
        a++;

        document.getElementById("wayToRight").style.display = "none";
      }
    }
    function getCenterFace() {
      //console.log("center", complete);
      if (
        face > 40 &&
        leftFace > 25 &&
        rightFace > 25 &&
        center == "false" &&
        complete == "false"
      ) {
        capture("center");
        a++;
        document.getElementById("centerface").style.display = "none";
      }
    }

    for (var s = 0; s < seq.length; s++) {
      if (seq[a] == 0) {
        document.getElementById("wayToLeft").style.display = "block";
        getLeftFace();
      }
      if (seq[a] == 1) {
        document.getElementById("wayToRight").style.display = "block";
        getRightFace();
      }
      if (seq[a] == 2) {
        document.getElementById("centerface").style.display = "block";
        getCenterFace();
      }
      if (seq.length == [a] && complete == "false") {
        s1.getTracks()[0].stop();
        socket.emit("stopVideo", randomId.toString());
        navigator.getUserMedia = null;
        complete = "true";
        state.video.pause();
        document.getElementById("main").style.display = "none";
        window.helloComponent.toggle();
        //socket.close();
      }
    }

    const coloredPartImageData = bodyPix.toColoredPartImageData(
      partSegmentation,
      partColorScales[guiState.partMap.colorScale]
    );

    bodyPix.drawMask(
      canvas,
      state.video,
      coloredPartImageData,
      flipHorizontally
    );

    drawVideoFrame();
    stats.end();
    requestAnimationFrame(bodySegmentationFrame);
  }

  bodySegmentationFrame();
}

export async function bindPage() {
  state.net = await bodyPix.load(+guiState.input.mobileNetArchitecture);

  document.getElementById("loading").style.display = "none";
  document.getElementById("main").style.display = "inline-block";

  await loadVideo();

  let cameras = await getVideoInputs();

  segmentBodyInRealTime();
}

async function capture(value) {
  //console.log("pir se", value);

  var canvas = document.getElementById(value);
  var video = document.getElementById("video");
  canvas.width = 400;
  canvas.height = 400;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  var dataURI = canvas.toDataURL("video/webm", 1);

  const b64toBlob = (b64Data, contentType = "", sliceSize = 512) => {
    const byteCharacters = window.atob(
      b64Data.replace(/^data:image\/(png|jpeg|jpg);base64,/, "")
    );
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  };

  let formdata = new FormData();
  formdata.append("personId", randomId.toString());

  formdata.append("image", b64toBlob(dataURI, "image/png"));

  const config = {
    headers: {
      "content-type": "multipart/form-data"
    }
  };
  axios
    .post(GlobalConfig.backendURL + "/api/v1/image", formdata, config)
    .then(res => {
      //console.log(res);
    });
}

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      instruction: "",
      modal: false
    };
    window.helloComponent = this;
    this.toggle = this.toggle.bind(this);
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    bindPage();
  }

  toggle() {
    if (this.state.modal == true) {
      this.close();
    }
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  close() {
    window.location.reload();
  }

  render() {
    const instruction = this.state.instruction;
    return (
      <>
        <Header />
        <Container className="mt--7" fluid>
          <Row>
            <Col className="mb-5 mb-xl-0" xl="12">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <Row className="align-items-center">
                    <div className="col">
                      {instruction}
                      <div style={hide} id="faceCover">
                        PLease come closer to the screen
                      </div>
                      <div style={hide} id="centerface">
                        Slowly move your head towards center
                      </div>
                      <div style={hide} id="wayToLeft">
                        Slowly move your head towards right
                      </div>
                      <div style={hide} id="wayToRight">
                        Slowly move your head towards left
                      </div>
                      <div style={hide} id="allDone">
                        All Done
                      </div>
                    </div>
                  </Row>
                </CardHeader>
                <CardBody>
                  <div>
                    <div id="stats" />
                    <div id="info" style={{ display: "none" }} />
                    <div id="loading">Loading the model...</div>

                    <Row>
                      <div
                        id="main"
                        className="col-md-7"
                        style={{ display: "none" }}
                      >
                        <video
                          id="video"
                          playsInline
                          style={{ width: "inherit" }}
                        />
                        <canvas id="output" style={hide} />
                        <canvas id="output1" style={hide} />
                      </div>
                      <div className="col-md-1" />
                      <div className="face-images col-md-4">
                        <canvas id="left" style={screenshot} />
                        <canvas id="center" style={screenshot} />
                        <canvas id="right" style={screenshot} />
                      </div>

                      <Modal
                        isOpen={this.state.modal}
                        toggle={this.toggle}
                        className={this.props.className}
                      >
                        <ModalHeader toggle={this.toggle}>
                          Complete - ID: {randomId}
                        </ModalHeader>
                        <ModalBody style={{ textAlign: "center" }}>
                          <b>Face Verification Complete</b>
                        </ModalBody>
                        <ModalFooter>
                          <Button
                            color="secondary"
                            onClick={() => this.close()}
                          >
                            close
                          </Button>
                        </ModalFooter>
                      </Modal>
                    </Row>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    );
  }
}

export default Index;



// --------------------------------
import React from "react";
import * as bodyPix from "@tensorflow-models/body-pix";
import Stats from "stats-js";
import * as partColorScales from "./part_color_scales";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, CardBody, Container, Row, Col, Button } from "reactstrap";
import socketIOClient from "socket.io-client";
import GlobalConfig from "./config";

const socket = socketIOClient(GlobalConfig.backendURL);
const hide = {
  display: "none"
};

const screenshot = {
  width: "200px"
};

const randomId = Math.floor(Math.random() * 90000) + 10000;
const stats = new Stats();

const state = {
  video: null,
  stream: null,
  net: null
};

var s1 = null;
async function setupCamera(cameraLabel) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      "Browser API navigator.mediaDevices.getUserMedia not available"
    );
  }

  const videoElement = document.getElementById("video");

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 1280,
      height: "auto"
      //frameRate: 35
    }
  });
  videoElement.srcObject = stream;
  s1 = stream;
  return new Promise(resolve => {
    videoElement.onloadedmetadata = () => {
      videoElement.width = videoElement.videoWidth;
      videoElement.height = videoElement.videoHeight;
      resolve(videoElement);
    };
  });
}

async function loadVideo(cameraLabel) {
  try {
    state.video = await setupCamera(cameraLabel);
  } catch (e) {
    let info = document.getElementById("info");
    info.textContent =
      "this browser does not support video capture," +
      "or this device does not have a camera";
    info.style.display = "block";
    throw e;
  }

  state.video.play();
}

const guiState = {
  flipHorizontal: true,
  input: {
    mobileNetArchitecture: "0.75", //layer size
    outputStride: 16 //accuracy and speed
  },
  partMap: {
    colorScale: "rainbow",
    segmentationThreshold: 0.5
  }
};

function segmentBodyInRealTime() {
  const canvas = document.getElementById("output");

  async function bodySegmentationFrame() {
    stats.begin();
    const outputStride = +guiState.input.outputStride;

    const flipHorizontally = guiState.flipHorizontal;

    const partSegmentation = await state.net.estimatePartSegmentation(
      state.video,
      outputStride,
      guiState.partMap.segmentationThreshold
    );

    //console.log("ccccc", partSegmentation);

    const coloredPartImageData = bodyPix.toColoredPartImageData(
      partSegmentation,
      partColorScales[guiState.partMap.colorScale]
    );

    bodyPix.drawMask(
      canvas,
      state.video,
      coloredPartImageData,
      flipHorizontally
    );

    stats.end();
    requestAnimationFrame(bodySegmentationFrame);
  }

  bodySegmentationFrame();
}

export async function bindPage() {
  state.net = await bodyPix.load(+guiState.input.mobileNetArchitecture);

  document.getElementById("loading").style.display = "none";
  document.getElementById("main").style.display = "inline-block";

  await loadVideo();

  segmentBodyInRealTime();
}

var intervalHandle = null;

function startFrames(value) {
  if (value == "stop") {
    clearInterval(intervalHandle);
    socket.emit("stopVideo", randomId.toString());
    return;
  }

  intervalHandle = setInterval(function() {
    const canvas = document.getElementById("output");
    var video = document.getElementById("video");

    var CANVAS_WIDTH = canvas.width;
    var CANVAS_HEIGHT = canvas.height;
    var ctxv = canvas.getContext("2d");
    ctxv.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    var a = canvas.toDataURL("image/png", 1);
    var videoObject = {
      frame: a,
      personId: randomId.toString()
    };
    console.log("qqqq", videoObject);
    socket.emit("frames", videoObject);
  }, 100);
}

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      instruction: ""
    };
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    bindPage();
  }

  start(value) {
    startFrames(value);
  }

  render() {
    const instruction = this.state.instruction;
    return (
      <Container className="mt--7" fluid>
        <Row>
          <Col className="mb-5 mb-xl-0" xl="12">
            <Card className="shadow">
              <CardBody>
                <div>
                  <div id="info" style={{ display: "none" }} />
                  <div id="loading">Loading the model...</div>

                  <Row>
                    <div
                      id="main"
                      className="col-md-12"
                      style={{ display: "none" }}
                    >
                      <video
                        id="video"
                        playsInline
                        style={{ width: "inherit", height: "600px" }}
                      />
                      <canvas id="output" style={hide} />
                    </div>

                    <div>
                      <Button
                        color="primary"
                        onClick={() => this.start("start")}
                      >
                        START
                      </Button>
                      <Button color="danger" onClick={() => this.start("stop")}>
                        STOP
                      </Button>
                    </div>
                  </Row>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Index;
