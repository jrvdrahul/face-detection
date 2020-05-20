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
import Step from "./Step.jsx";
//import Form from "views/examples/Onboardform";
const line = {
  width: "2px",
  height: "100px",
  background: "black"
};

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: "step"
    };
  }

  choose(value) {
    if (this.state.page === "step") {
      return <Step />;
    }
    // } else if (this.state.page === "form") {
    //   return <Form />;
    // }
  }

  render() {
    return (
      <>
        <Header />
        {this.choose()}
      </>
    );
  }
}

export default Index;
