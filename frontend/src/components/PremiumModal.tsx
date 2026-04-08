import React, { useState } from "react";
import { Button } from "./ui/button";
import { X, Check } from "lucide-react";
import axiosInstance from "../lib/AxiosInstance";
import { useUser } from "../lib/AuthContext";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: "watch" | "download";
}

const PLAN_LIMITS: Record<string, string> = {
  Free: "5 minutes",
  Bronze: "7 minutes",
  Silver: "10 minutes",
  Gold: "Unlimited",
};

const PLAN_WEIGHTS: Record<string, number> = {
  Free: 0,
  Bronze: 1,
  Silver: 2,
  Gold: 3,
};

const PremiumModal = ({ isOpen, onClose, feature = "watch" }: PremiumModalProps) => {
  const { user, login } = useUser();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const currentPlan = user?.plan || "Free";
  const currentWeight = PLAN_WEIGHTS[currentPlan];

  const title =
    feature === "download"
      ? "Upgrade to Keep Downloading"
      : "Upgrade to Keep Watching";

  const handlePayment = async (plan: string) => {
    setLoading(true);
    try {
      const res = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js",
      );

      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      const result = await axiosInstance.post("/payment/order", { plan });

      if (!result) {
        alert("Server error. Are you online?");
        setLoading(false);
        return;
      }

      const { amount, id: order_id, currency } = result.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount.toString(),
        currency: currency,
        name: "YouTube Clone Premium",
        description: `${plan} Plan Upgrade`,
        order_id: order_id,
        handler: async function (response: any) {
          const data = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            userId: user._id,
            email: user.email,
            plan: plan,
          };

          const result = await axiosInstance.post("/payment/verify", data);
          if (result.data.isPremium) {
            alert(
              `Welcome to the ${plan} Plan! An invoice has been emailed to you.`,
            );
            login({ ...user, plan: plan });
            onClose();
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#ff0000",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment creation failed:", error);
      alert("Payment creation failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90dvh] overflow-y-auto relative dark:bg-gray-900 dark:text-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-4 dark:text-white">{title}</h2>

        <p className="text-gray-600 mb-6 dark:text-gray-300 text-lg">
          {feature === "download" ? (
            <>
              You've reached your{" "}
              <strong className="text-black dark:text-white">
                {currentPlan}
              </strong>{" "}
              plan daily download limit. Upgrade to a higher tier below to
              unlock more downloads!
            </>
          ) : (
            <>
              You've reached your{" "}
              <strong className="text-black dark:text-white">
                {currentPlan}
              </strong>{" "}
              plan watch limit of{" "}
              <strong className="text-red-600 dark:text-red-400">
                {PLAN_LIMITS[currentPlan]}
              </strong>
              . Upgrade to a higher tier below to unlock more time!
            </>
          )}
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Bronze Plan */}
          <div
            className={`border rounded-lg p-5 flex flex-col ${currentWeight >= PLAN_WEIGHTS["Bronze"] ? "bg-gray-50 dark:bg-gray-800 opacity-60" : "bg-orange-50 dark:bg-orange-900"}`}
          >
            <h3 className="font-semibold text-xl text-orange-800 border-b pb-2 mb-4 dark:text-orange-400">
              Bronze
            </h3>
            <ul className="space-y-3 text-sm text-gray-700 grow dark:text-gray-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> 7 mins watch limit
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> Unlimited Video
                Downloads
              </li>
            </ul>
            <div className="text-3xl font-bold my-4">₹10</div>
            {currentWeight >= PLAN_WEIGHTS["Bronze"] ? (
              <Button
                disabled
                className="w-full mt-auto bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
              >
                {currentWeight === PLAN_WEIGHTS["Bronze"]
                  ? "Current Plan"
                  : "Included in Current"}
              </Button>
            ) : (
              <Button
                disabled={loading}
                onClick={() => handlePayment("Bronze")}
                className="w-full mt-auto bg-orange-600 hover:bg-orange-700 text-white"
              >
                Upgrade to Bronze
              </Button>
            )}
          </div>

          {/* Silver Plan */}
          <div
            className={`border rounded-lg p-5 flex flex-col relative md:transform md:scale-105 shadow-lg ${currentWeight >= PLAN_WEIGHTS["Silver"] ? "bg-gray-50 dark:bg-gray-800 opacity-60" : "bg-gray-100 dark:bg-gray-800 dark:border-gray-700"}`}
          >
            {currentWeight < PLAN_WEIGHTS["Silver"] && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg">
                Popular
              </div>
            )}
            <h3 className="font-semibold text-xl text-gray-800 border-b pb-2 mb-4 dark:text-white">
              Silver
            </h3>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300 grow">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> 10 mins watch limit
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> Unlimited Video
                Downloads
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> Priority Support
              </li>
            </ul>
            <div className="text-3xl font-bold my-4">₹50</div>
            {currentWeight >= PLAN_WEIGHTS["Silver"] ? (
              <Button
                disabled
                className="w-full mt-auto bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
              >
                {currentWeight === PLAN_WEIGHTS["Silver"]
                  ? "Current Plan"
                  : "Included in Current"}
              </Button>
            ) : (
              <Button
                disabled={loading}
                onClick={() => handlePayment("Silver")}
                className="w-full mt-auto bg-gray-600 hover:bg-gray-700 text-white dark:bg-gray-600 dark:hover:bg-gray-500"
              >
                Upgrade to Silver
              </Button>
            )}
          </div>

          {/* Gold Plan */}
          <div
            className={`border rounded-lg p-5 flex flex-col ${currentWeight >= PLAN_WEIGHTS["Gold"] ? "bg-gray-50 dark:bg-gray-800 opacity-60" : "bg-yellow-50 dark:bg-yellow-900"}`}
          >
            <h3 className="font-semibold text-xl text-yellow-800 border-b pb-2 mb-4 dark:text-yellow-400">
              Gold
            </h3>
            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300 grow">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> Unlimited watch
                time
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> Unlimited Video
                Downloads
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> Ad-free experience
              </li>
            </ul>
            <div className="text-3xl font-bold my-4">₹100</div>
            {currentWeight >= PLAN_WEIGHTS["Gold"] ? (
              <Button
                disabled
                className="w-full mt-auto bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
              >
                Current Plan
              </Button>
            ) : (
              <Button
                disabled={loading}
                onClick={() => handlePayment("Gold")}
                className="w-full mt-auto bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                Upgrade to Gold
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function loadScript(src: string) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export default PremiumModal;
