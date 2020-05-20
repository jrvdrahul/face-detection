import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  Button,
  FormGroup,
  Input
} from "reactstrap";
import axios from "axios";
import GlobalConfig from "../../config";
import Loader from "./Loader";

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      loader: false
    };
  }

  loader() {
    if (this.state.loader) {
      return <Loader message="Redirecting to face detection" />;
    }
  }

  submit() {
    this.setState({
      loader: true
    });

    const data = {
      name: this.state.name,
      userData: this.state.userData
    };

    axios
      .post(GlobalConfig.backendURL + "/api/v1/person/", data)
      .then(response => {
        const data = response.data.personId;
        window.location = "face-verification/" + data;
      })
      .catch(error => {
        throw error;
      });
  }

  render() {
    return (
      <>
        <Container className="mt--7" fluid>
          {this.loader()}
          <Row>
            <Col className="mb-5 mb-xl-0" xl="12">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <Row className="align-items-center">Fill details</Row>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col lg="6">
                      <FormGroup>
                        <label className="form-control-label">Name</label>
                        <Input
                          className="form-control-alternative"
                          placeholder="Name"
                          type="text"
                          onChange={event =>
                            this.setState({ name: event.target.value })
                          }
                        />
                      </FormGroup>
                    </Col>
                    <Col lg="6">
                      <FormGroup>
                        <label className="form-control-label">User data</label>
                        <Input
                          className="form-control-alternative"
                          placeholder="User data"
                          type="text"
                          onChange={event =>
                            this.setState({ userData: event.target.value })
                          }
                        />
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
        </Container>
      </>
    );
  }
}

export default Index;
