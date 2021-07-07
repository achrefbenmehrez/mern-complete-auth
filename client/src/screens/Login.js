import React, { useState } from "react";
import authSvg from "../assets/login.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authenticate, isAuth } from "../helpers/auth";
import axios from "axios";
import { Redirect } from "react-router-dom";
import { Link } from 'react-router-dom';

import env from "react-dotenv";

import GoogleLogin from "react-google-login";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

const Login = ({ history }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const handleChange = (text) => (e) => {
    setFormData({
      ...formData,
      [text]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      axios
        .post(`${window.env.CLIENT_URL}/users/login`, {
          email,
          password,
        })
        .then((res) => {
          authenticate(res, () => {
            setFormData({
              ...formData,
              email: "",
              password1: "",
              textChange: "Submitted",
            });
            isAuth() && isAuth().role === "admin"
              ? history.push("/admin")
              : history.push("/private");
            toast.success(`Hey ${res.data.user.name}, Welcome back!`);
          });
        })
        .catch((err) => {
          toast.error(err.response.data.error);
        });
    } else {
      toast.error("Please fill all fields");
    }
  };

  const sendFacebookToken = (userId, accessToken) => {
    axios
      .post(`${process.env.CLIENT_URL}/facebook-login`, {
        userId,
        accessToken,
      })
      .then((res) => {
        informParent(res);
      })
      .catch((err) => {
        toast.error("Facebook login failed");
      });
  };

  const sendGoogleToken = (tokenId) => {
    axios
      .post(`${window.env.CLIENT_URL}/users/google-login`, {
        idToken: tokenId,
      })
      .then((response) => {
        informParent(response);
      })
      .catch((err) => {
        toast.error("Google Login failed, please try again");
      });
  };

  const informParent = (response) => {
    authenticate(response, () => {
      isAuth && isAuth.role === "admin"
        ? history.push("/admin")
        : history.push("/private");
    });
  };

  const responseFacebook = (response) => {
    sendFacebookToken(response.userId, response.accessToken);
  };

  const responseGoogle = (response) => {
    sendGoogleToken(response.tokenId);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      {isAuth() ? <Redirect to="/" /> : null}
      <ToastContainer />
      <div className="max-w-screen-xl m-0 sm:m-20 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <div className="mt-12 flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-extrabold">Login</h1>

            <form
              className="w-full flex-1 mt-8 text-indigo-500"
              onSubmit={handleSubmit}
            >
              <div className="mx-auto max-w-xs relative ">
                <input
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                  type="email"
                  placeholder="Email"
                  onChange={handleChange("email")}
                  value={email}
                />
                <input
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                  type="password"
                  placeholder="Password"
                  onChange={handleChange("password")}
                  value={password}
                />
                <button
                  type="submit"
                  className="mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                >
                  <i className="fas fa-user-plus fa 1x w-6  -ml-2" />
                  <span className="ml-3">Log in</span>
                </button>
              </div>
              <div className="my-12 border-b text-center">
                <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                  Or sign in with email or social login
                </div>
              </div>
              <div className="flex flex-col items-center">
                <a
                  className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3
           bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline mt-5"
                  href="/register"
                  target="_self"
                >
                  <i className="fas fa-sign-in-alt fa 1x w-6  -ml-2 text-indigo-500" />
                  <span className="ml-4">Sign up</span>
                </a>
                <GoogleLogin
                  clientId={window.env.GOOGLE_CLIENT}
                  onSuccess={responseGoogle}
                  onFailure={responseGoogle}
                  cookiePolicy={"single_host_origin"}
                  render={(renderProps) => (
                    <button
                      onClick={renderProps.onClick}
                      disabled={renderProps.disabled}
                      className="mt-3 w-full max-w-xs font-bold shadow-sm rounded-lg py-3
                      bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline"
                    >
                      Sign in with Google
                    </button>
                  )}
                ></GoogleLogin>
                <FacebookLogin
                  appId={window.env.FACEBOOK_CLIENT}
                  autoLoad={true}
                  fields="name,email,picture"
                  onClick={responseFacebook}
                  callback={responseFacebook}
                  render={(renderProps) => (
                    <button
                      onClick={renderProps.onClick}
                      disabled={renderProps.disabled}
                      className="mt-3 w-full max-w-xs font-bold shadow-sm rounded-lg py-3
                      bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline"
                    >
                      Sign in with Facebook
                    </button>
                  )}
                />
                <Link
                  to='/forgot-password'
                  className='no-underline hover:underline text-indigo-500 text-md text-right absolute right-0  mt-2'
                >
                  Forget password?
                </Link>
              </div>
            </form>
          </div>
        </div>
        <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
          <div
            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${authSvg})` }}
          ></div>
        </div>
      </div>
      ;
    </div>
  );
};

export default Login;
