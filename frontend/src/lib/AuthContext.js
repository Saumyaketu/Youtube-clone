"use client";
import { createContext, useState, useEffect, useContext } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { provider, auth } from "./firebase";
import axiosInstance from "./AxiosInstance";

const UserContext = createContext();

const SOUTH_INDIAN_STATES = [
  "tamil nadu",
  "kerala",
  "karnataka",
  "andhra pradesh",
  "telangana",
];

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [locationState, setLocationState] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [pendingUserData, setPendingUserData] = useState(null);

  useEffect(() => {
    const fetchLocationAndTheme = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        const userState = data.region?.toLowerCase();
        setLocationState(userState);

        const currentHour = new Date().getHours();
        const isTimeBetween10And12 = currentHour >= 10 && currentHour < 12;
        const isSouthIndia = userState && SOUTH_INDIAN_STATES.includes(userState);

        const root = window.document.documentElement;
        if (isTimeBetween10And12 && isSouthIndia) {
          root.classList.remove("dark");
        } else {
          root.classList.add("dark");
        }
      } catch (error) {
        console.error("Location fetch failed", error);
        window.document.documentElement.classList.add("dark");
      }
    };
    fetchLocationAndTheme();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    sessionStorage.removeItem("pendingOtp");
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            // reCAPTCHA solved
          },
        },
      );
    }
  };

  const handleGoogleSignIn = async (phone = null) => {
    const validPhone = typeof phone === "string" ? phone : null;
    try {
      sessionStorage.setItem("pendingOtp", "true");
      const result = await signInWithPopup(auth, provider);

      if (result?.user) {
        const payload = {
          email: result.user.email,
          name: result.user.displayName,
          image: result.user.photoURL || "https://github.com/shadcn.png",
          state: locationState,
          phone: validPhone,
        };
        const isSouthIndia = SOUTH_INDIAN_STATES.includes(locationState);

        if (isSouthIndia) {
          const response = await axiosInstance.post("/user/login", payload);
          if (response.data.requiresOtp) {
            setPendingEmail(result.user.email);
            setShowOtpModal(true);
          }
        } else {
          if (!validPhone) return console.error("Phone number missing!");

          setPendingUserData(payload);
          setupRecaptcha();
          const appVerifier = window.recaptchaVerifier;
          const formattedPhone = validPhone.startsWith("+91")
            ? validPhone
            : `+91${validPhone.replace(/\D/g, "")}`;
          const confirmation = await signInWithPhoneNumber(
            auth,
            formattedPhone,
            appVerifier,
          );
          setConfirmationResult(confirmation);
          setShowOtpModal(true);
        }
      }
    } catch (error) {
      sessionStorage.removeItem("pendingOtp");
      if (
        error.code !== "auth/cancelled-popup-request" &&
        error.code !== "auth/popup-closed-by-user"
      ) {
        console.error("Popup sign-in error:", error);
      }
    }
  };

  const verifyOtpAndLogin = async (otp) => {
    const isSouthIndia = locationState && SOUTH_INDIAN_STATES.includes(locationState);

    try {
      if (isSouthIndia) {
        const response = await axiosInstance.post("/user/verify-otp", {
          email: pendingEmail,
          otp,
        });
        if (response.data.result) {
          sessionStorage.removeItem("pendingOtp");
          login(response.data.result);
          setShowOtpModal(false);
          return true;
        }
      } else {
        const result = await confirmationResult.confirm(otp);
        if (result.user) {
          const payload = { ...pendingUserData, skipOtp: true };
          const response = await axiosInstance.post("/user/login", payload);
          if (response.data.result) {
            sessionStorage.removeItem("pendingOtp");
            login(response.data.result);
            setShowOtpModal(false);
            return true;
          }
        }
      }
    } catch (error) {
      console.error("OTP Verification Failed:", error);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (sessionStorage.getItem("pendingOtp") === "true") {
        return;
      }
      if (firebaseUser && !user) {
        try {
          const payload = {
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            image: firebaseUser.photoURL || "https://github.com/shadcn.png",
            skipOtp: true,
          };
          const response = await axiosInstance.post("/user/login", payload);
          if (response.data.result) {
            login(response.data.result);
          }
        } catch (error) {
          console.error(error);
          logout();
        }
      }
    });
    return () => unsubscribe();
  }, [user, locationState]);
  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        handleGoogleSignIn,
        locationState,
        showOtpModal,
        setShowOtpModal,
        verifyOtpAndLogin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
