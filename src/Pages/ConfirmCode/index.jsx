import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

import loginLogo from "@/assets/icons/login_logo.png";
import { confirmSignUp } from "../../utils/authenticate";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

let email;

const ConfirmCode = () => {
  const Navigate = useNavigate();
  const location = useLocation();

  const [confirmCode, setConfirmCode] = useState("");

  useEffect(() => {
    email = location.state?.email;
  }, []);

  const handleConfirm = async (e) => {
    e.preventDefault();

    try {
      await confirmSignUp(email, confirmCode);
      Navigate("/signin");
    } catch (error) {
      const notify = () =>
        toast.error("Does not matched confirmation code", {
          position: "top-right",
          autoClose: 2500,
          theme: "colored",
        });

      notify();
    }
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
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-xl dark:text-white">
              Check your email for verification code
            </h1>

            <form className="max-w-sm mx-auto">
              {/* <label
                for="number-input"
                className="flex mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Select a number:
              </label> */}
              <input
                type="text"
                id="number-input"
                // aria-describedby="helper-text-explanation"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="90210"
                required
                onChange={(e) => setConfirmCode(e.target.value)}
              />
            </form>

            <button
              type="submit"
              className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              onClick={handleConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>

      <ToastContainer />
    </section>
  );
};

export default ConfirmCode;
