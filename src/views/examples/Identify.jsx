import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  FormGroup,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "reactstrap";
import "../../assets/css/mainCustom.css";
import axios from "axios";
import Webcam from "react-webcam";
import GlobalConfig from "../../config";
import Loader from "./Loader";

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      data: [],
      loader: false
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  loader() {
    if (this.state.loader) {
      return <Loader message="Identifying Person" />;
    }
  }

  setRef = webcam => {
    this.webcam = webcam;
  };

  capture = () => {
    const imageSrc = this.webcam.getScreenshot();
    this.setState({ image: imageSrc });
  };

  _handleImageChange(e) {
    e.preventDefault();
    // this.setState({
    //   loader: true
    // });
    // setTimeout(() => {
    //   this.setState({
    //     loader: false
    //   });
    // }, 4000);

    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result
      });
    };
    reader.readAsDataURL(file);
  }

  submit() {
    this.setState({
      loader: true
    });

    const b64toBlob = (b64Data, contentType = "", sliceSize = 512) => {
      const byteCharacters = window.atob(
        b64Data.replace(/^data:image\/(png|jpeg|jpg);base64,/, "")
      );
      const byteArrays = [];

      for (
        let offset = 0;
        offset < byteCharacters.length;
        offset += sliceSize
      ) {
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

    let formData = new FormData();
    if (this.state.file) {
      formData.append("file", this.state.file, "image/jpeg");
    } else {
      formData.append("file", b64toBlob(this.state.image, "image/jpeg"));
    }

    axios
      .post("https://tmonkey.broker.alphafortress.com/api/file", formData)
      .then(response => {
        const imgurl =
          "https://tmonkey.broker.alphafortress.com/api/file/" +
          response.data.name;

        axios
          .post(GlobalConfig.backendURL + "/api/v1/detectandidentify/", {
            imageURL: imgurl
          })
          .then(response => {
            this.setState({
              data: response.data.candidate,
              loader: false,
              modal: true
            });
          })
          .catch(error => {
            this.setState({
              error: "No face Detected",
              loader: false,
              modal: true
            });
            throw error;
          });
      })
      .catch(error => {
        throw error;
      });
  }

  image() {
    if (this.state.image) {
      return <img class="switch" src={this.state.image} alt="" />;
    } else {
      const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
      };
      return (
        <div>
          <Webcam
            className="video-identify"
            style={{ transform: "rotatey(180deg)" }}
            audio={false}
            height={"auto"}
            ref={this.setRef}
            screenshotFormat="image/jpeg"
            width={700}
            videoConstraints={videoConstraints}
          />

          <Button onClick={this.capture} style={{ display: "block" }}>
            Capture photo
          </Button>
        </div>
      );
    }
  }

  render() {
    let { imagePreviewUrl } = this.state;
    let $imagePreview = null;
    if (imagePreviewUrl) {
      $imagePreview = <embed src={imagePreviewUrl} />;
    } else {
      $imagePreview = (
        <div className="previewText">Please select an Image for Preview</div>
      );
    }
    return (
      <>
        <Container className="mt--7" fluid>
          {this.loader()}
          <Row>
            <Col className="mb-5 mb-xl-0" xl="12">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <Row className="align-items-center">Identify Person</Row>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg="12">
                      <FormGroup>{this.image()}</FormGroup>
                    </Col>
                    <div>OR</div>
                    <Col lg="12">
                      <FormGroup>
                        <form onSubmit={e => this._handleSubmit(e)}>
                          <input
                            className="btn"
                            type="file"
                            onChange={e => this._handleImageChange(e)}
                            style={{ background: "white", width: "260px" }}
                          />
                        </form>
                        <br></br>
                        <div className="imgPreview">{$imagePreview}</div>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Button color="primary" onClick={() => this.submit()}>
                      Submit
                    </Button>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Modal
            isOpen={this.state.modal}
            toggle={this.toggle}
            className={this.props.className}
          >
            <ModalHeader toggle={this.toggle}>
              Person Identify Complete
            </ModalHeader>
            <ModalBody>
              {this.state.error ? (
                <div>{this.state.error}</div>
              ) : (
                <div>
                  <div>Name-: {this.state.data.name}</div>
                  <div>Confidence-: {this.state.data.confidence * 100} %</div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={this.toggle}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
        </Container>
      </>
    );
  }
}

export default Index;
