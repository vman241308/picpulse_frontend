import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticate } from "../../utils/authenticate";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import loginLogo from "@/assets/icons/login_logo.png";

const SignIn = () => {
  const Navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [signInErr, setSignInErr] = useState("");

  const formInputChange = (formField, value) => {
    if (formField === "email") {
      setEmail(value);
    }
    if (formField === "password") {
      setPassword(value);
    }
  };

  const validation = () => {
    return new Promise((resolve, reject) => {
      if (email === "" && password === "") {
        setEmailErr("Email is Required");
        setPasswordErr("Password is required");
        resolve({
          email: "Email is Required",
          password: "Password is required",
        });
      } else if (email === "") {
        setEmailErr("Email is Required");
        resolve({ email: "Email is Required", password: "" });
      } else if (password === "") {
        setPasswordErr("Password is required");
        resolve({ email: "", password: "Password is required" });
      } else if (password.length < 6) {
        setPasswordErr("must be 6 character");
        resolve({ email: "", password: "must be 6 character" });
      } else {
        resolve({ email: "", password: "" });
      }
    });
  };

  const handleClick = (e) => {
    e.preventDefault();
    validation()
      .then(
        (res) => {
          if (res.email === "" && res.password === "") {
            authenticate(email, password)
              .then(
                (data) => {
                  console.log("data", data);
                  setSignInErr("");
                  Navigate("/");
                },
                (err) => {
                  console.log(err);
                  setSignInErr(err.message);

                  const notify = () =>
                    toast.error(err.message, {
                      position: "top-right",
                      autoClose: 2500,
                      theme: "colored",
                    });

                  notify();
                }
              )
              .catch((err) => console.log(err));
          }
        },
        (err) => console.log(err)
      )
      .catch((err) => console.log(err));
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a
          href="#"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        >
          <img className="w-8 h-8 mr-2" src={loginLogo} alt="logo" />
          Picpulse
        </a>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>
            <form className="space-y-4 md:space-y-6" action="#">
              <div>
                <label
                  for="email"
                  className="flex mb-2 items-start text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="john@company.com"
                  required=""
                  onChange={(e) => formInputChange("email", e.target.value)}
                />
              </div>
              <div>
                <label
                  for="password"
                  className="flex mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required=""
                  value={password}
                  onChange={(e) => {
                    formInputChange("password", e.target.value);
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="remember"
                      aria-describedby="remember"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                      required=""
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      for="remember"
                      className="text-gray-500 dark:text-gray-300 flex"
                    >
                      Remember me
                    </label>
                  </div>
                </div>
                {/* <a
                  href="#"
                  className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Forgot password?
                </a> */}
              </div>
              <button
                type="submit"
                className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                onClick={handleClick}
              >
                Sign In
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don’t have an account yet?{" "}
                <a
                  href="#"
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                  onClick={() => Navigate("/signup")}
                >
                  Sign up
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>

      <ToastContainer />
    </section>
  );
};

export default SignIn;
