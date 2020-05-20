import React from "react";
import * as bodyPix from "@tensorflow-models/body-pix";
import Stats from "stats.js";
import * as partColorScales from "../../part_color_scales";
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
//import socketIOClient from "socket.io-client";
import GlobalConfig from "../../config";
import Loader from "./Loader";

//const socket = socketIOClient(GlobalConfig.backendURL);
const hide = {
  display: "none"
};

const screenshot = {
  width: "200px"
};

const urlParams = window.location.pathname;
const s = urlParams.split("/");
const randomId = s[s.length - 1];

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
  // function drawVideoFrame(time) {
  //   const canvas = document.getElementById("output");
  //   var video = document.getElementById("video");

  //   var CANVAS_WIDTH = canvas.width;
  //   var CANVAS_HEIGHT = canvas.height;
  //   var ctxv = canvas.getContext("2d");
  //   ctxv.drawImage(video, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  //   var a = canvas.toDataURL("image/png", 1);
  //   var videoObject = {
  //     frame: a,
  //     personId: randomId.toString()
  //   };
  //   //socket.emit("frames", videoObject);
  // }

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
      if (leftFace > 25 && leftFace < 30 && l1 == "false") {
        l1 = "true";
        capture("left");
      }
      if (leftFace > 30 && leftFace < 35 && l2 == "false") {
        l2 = "true";
        capture("left");
      }
      if (leftFace > 35 && leftFace < 40 && l3 == "false") {
        l3 = "true";
        capture("left");
      }
      if (leftFace > 40 && l1 == "true" && l2 == "true" && l3 == "true") {
        capture("left");
        a++;
        document.getElementById("wayToLeft").style.display = "none";
      }
    }
    function getRightFace() {
      if (rightFace > 25 && rightFace < 30 && r1 == "false") {
        r1 = "true";
        capture("right");
      }
      if (rightFace > 30 && rightFace < 35 && r2 == "false") {
        r2 = "true";
        capture("right");
      }
      if (rightFace > 35 && rightFace < 40 && r3 == "false") {
        r3 = "true";
        capture("right");
      }
      if (rightFace > 40 && r1 == "true" && r2 == "true" && r3 == "true") {
        capture("right");
        a++;

        document.getElementById("wayToRight").style.display = "none";
      }
    }
    function getCenterFace() {
      if (face > 40 && leftFace > 25 && rightFace > 25 && center == "false") {
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
        //socket.emit("stopVideo", randomId.toString());
        navigator.getUserMedia = null;
        complete = "true";
        state.video.pause();
        document.getElementById("main").style.display = "none";
        document.getElementById("face-images").style.display = "block";

        window.helloComponent.hitApi(randomId);

        //window.helloComponent.toggle();
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

    //drawVideoFrame();
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

  //let cameras = await getVideoInputs();

  segmentBodyInRealTime();
}

async function capture(value) {
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
      modal: false,
      loader: false
    };
    window.helloComponent = this;
    this.toggle = this.toggle.bind(this);
    this.hitApi = this.hitApi.bind(this);

    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    bindPage();
  }

  loader() {
    if (this.state.loader) {
      return <Loader message="Recording your data" />;
    }
  }

  hitApi(id) {
    var intervalHandle = null;
    const data = {
      personId: id
    };

    this.setState({
      loader: true
    });
    axios
      .post(GlobalConfig.backendURL + "/api/v1/person/face", data)
      .then(response => {
        if ((response.status = true)) {
          axios
            .post(GlobalConfig.backendURL + "/api/v1/person/train/start/")
            .then(response => {
              intervalHandle = setInterval(() => {
                axios
                  .get(GlobalConfig.backendURL + "/api/v1/person/train/status/")
                  .then(response => {
                    if (response.data.data.status == "succeeded") {
                      clearInterval(intervalHandle);
                      this.setState({
                        loader: false
                      });
                      this.toggle();
                    }
                  })
                  .catch(error => {
                    throw error;
                  });
              }, 2000);
            })
            .catch(error => {
              throw error;
            });
        }
      })
      .catch(error => {
        throw error;
      });
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
    window.location = "/admin/index";
  }

  render() {
    const instruction = this.state.instruction;
    return (
      <>
        <Header />
        <Container className="mt--7" fluid>
          {this.loader()}
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
                      <div
                        className="face-images col-md-4"
                        id="face-images"
                        style={hide}
                      >
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
