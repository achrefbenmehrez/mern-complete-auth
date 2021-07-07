import ReactDOM from "react-dom";
import App from "./App";

import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";

import Register from "./screens/Register";
import Activate from "./screens/Activate";
import Login from "./screens/Login";
import ForgotPassword from "./screens/ForgotPassword";
import ResetPassword from "./screens/ResetPassword";

ReactDOM.render(
  <BrowserRouter>
    <Switch>
      <Route path="/" exact render={(props) => <App {...props} />} />
      <Route
        path="/register"
        exact
        render={(props) => <Register {...props} />}
      />
      <Route
        path="/login"
        exact
        render={(props) => <Login {...props} />}
      />
      <Route
        path="/forgot-password"
        exact
        render={(props) => <ForgotPassword {...props} />}
      />
      <Route
        path="/users/reset-password/:token"
        exact
        render={(props) => <ResetPassword {...props} />}
      />
      <Route path="/users/activate/:token" exact render={(props) => <Activate {...props} />} />
    </Switch>
  </BrowserRouter>,
  document.getElementById("root")
);
