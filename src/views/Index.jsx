import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  Button
} from "reactstrap";
import Header from "components/Headers/Header.jsx";
import Form from "./examples/Onboardform";
import Identify from "./examples/Identify";
import "./../assets/css/mainCustom.css";

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: ""
    };
  }

  choose(value) {
    this.setState({
      page: value
    });
  }

  step() {
    if (this.state.page === "onBoard") {
      return <Form />;
    } else if (this.state.page === "identify") {
      return <Identify />;
    } else {
      return (
        <Container className="mt--7" fluid>
          <Row>
            <Col className="mb-5 mb-xl-0" xl="12">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <Row className="align-items-center">choose Your option</Row>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg="5">
                      <Button
                        color="primary"
                        onClick={() => this.choose("onBoard")}
                      >
                        ON BOARD PERSON
                      </Button>
                    </Col>
                    <Col lg="2">
                      <div className="line"></div>
                    </Col>
                    <Col lg="5">
                      <Button
                        color="primary"
                        onClick={() => this.choose("identify")}
                      >
                        IDENTIFY PERSON
                      </Button>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      );
    }
  }

  render() {
    return (
      <>
        <Header />
        {this.step()}
      </>
    );
  }
}

export default Index;
