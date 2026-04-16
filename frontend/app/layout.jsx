"use client";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import PropTypes from "prop-types";

export default function RootLayout({children}) {
  return (
    <html lang="en">
      <body>
        {children}

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};