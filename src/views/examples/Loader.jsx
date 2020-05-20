import React from "react";

// reactstrap components
import {} from "reactstrap";
// core components
import loader from "../../assets/img/loader.gif";

const show = {
  top: 0,
  left: 0,
  position: "fixed",
  zIndex: 2,
  width: "100%",
  display: "block",
  height: "100%",
  background: "rgba(2, 45, 120, 0.6)"
};

const img = {
  position: "relative",
  top: "50%",
  textAlign: "center",
  color: "white"
};

class Profile extends React.Component {
  render() {
    return (
      <div style={show}>
        <div style={img}>
          <img src={loader} alt="" />
          <p>{this.props.message}</p>
        </div>
      </div>
    );
  }
}

export default Profile;
