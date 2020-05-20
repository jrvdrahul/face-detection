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
import Index from "views/Index.jsx";
import Form from "views/examples/Onboardform.jsx";
import Face from "views/examples/Face.jsx";
import Identify from "views/examples/Identify.jsx";
// import Profile from "views/examples/Profile.jsx";
// import Maps from "views/examples/Maps.jsx";
// import Register from "views/examples/Register.jsx";
// import Login from "views/examples/Login.jsx";
// import Tables from "views/examples/Tables.jsx";
// import Icons from "views/examples/Icons.jsx";

var routes = [
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: Index,
    layout: "/admin"
  },
  {
    path: "/onboard-form",
    name: "onboard form",
    icon: "ni ni-single-02 text-yellow",
    component: Form,
    layout: "/admin"
  },
  {
    path: "/face-verification",
    name: "face verification",
    icon: "ni ni-single-02 text-yellow",
    component: Face,
    layout: "/admin"
  },
  {
    path: "/identify",
    name: "identify",
    icon: "ni ni-single-02 text-yellow",
    component: Identify,
    layout: "/admin"
  }
  // {
  //   path: "/icons",
  //   name: "Icons",
  //   icon: "ni ni-planet text-blue",
  //   component: Icons,
  //   layout: "/admin"
  // },
  // {
  //   path: "/maps",
  //   name: "Maps",
  //   icon: "ni ni-pin-3 text-orange",
  //   component: Maps,
  //   layout: "/admin"
  // },
  // {
  //   path: "/user-profile",
  //   name: "User Profile",
  //   icon: "ni ni-single-02 text-yellow",
  //   component: Profile,
  //   layout: "/admin"
  // },
  // {
  //   path: "/tables",
  //   name: "Tables",
  //   icon: "ni ni-bullet-list-67 text-red",
  //   component: Tables,
  //   layout: "/admin"
  // },
  // {
  //   path: "/login",
  //   name: "Login",
  //   icon: "ni ni-key-25 text-info",
  //   component: Login,
  //   layout: "/auth"
  // },
  // {
  //   path: "/register",
  //   name: "Register",
  //   icon: "ni ni-circle-08 text-pink",
  //   component: Register,
  //   layout: "/auth"
  // }
];
export default routes;
