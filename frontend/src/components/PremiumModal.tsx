import React, { useState } from "react";
import { Button } from "./ui/button";
import { X, Check } from "lucide-react";
import axiosInstance from "../lib/AxiosInstance";
import { useUser } from "../lib/AuthContext";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumModal = ({ isOpen, onClose }: PremiumModalProps) => {
  const { user, login } = useUser();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async (plan: String) => {
    setLoading(true);
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js",
    );

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      const result = await axiosInstance.post("/payment/order");

      if (!result) {
        alert("Server error. Are you online?");
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
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      alert("Payment creation failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-4">Upgrade to Keep Watching</h2>
        <p className="text-gray-600 mb-6">
          You've reached your watch limit. Upgrade to unlock more time and
          unlimited downloads!
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Bronze Plan */}
          <div className="border rounded-lg p-5 bg-orange-50 flex flex-col">
            <h3 className="font-semibold text-xl text-orange-800 border-b pb-2 mb-4">
              Bronze
            </h3>
            <ul className="space-y-3 text-sm text-gray-700 grow">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> 7 mins watch limit
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> Unlimited Video
                Downloads
              </li>
            </ul>
            <div className="text-3xl font-bold my-4">₹10</div>
            <Button
              disabled={loading}
              onClick={() => handlePayment("Bronze")}
              className="w-full mt-auto bg-orange-600 hover:bg-orange-700"
            >
              Select Bronze
            </Button>
          </div>

          {/* Silver Plan */}
          <div className="border rounded-lg p-5 bg-gray-100 flex flex-col relative transform scale-105 shadow-lg">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg">
              Popular
            </div>
            <h3 className="font-semibold text-xl text-gray-800 border-b pb-2 mb-4">
              Silver
            </h3>
            <ul className="space-y-3 text-sm text-gray-700 grow">
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
            <Button
              disabled={loading}
              onClick={() => handlePayment("Silver")}
              className="w-full mt-auto bg-gray-600 hover:bg-gray-700"
            >
              Select Silver
            </Button>
          </div>

          {/* Gold Plan */}
          <div className="border rounded-lg p-5 bg-yellow-50 flex flex-col">
            <h3 className="font-semibold text-xl text-yellow-800 border-b pb-2 mb-4">
              Gold
            </h3>
            <ul className="space-y-3 text-sm text-gray-700 grow">
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
            <Button
              disabled={loading}
              onClick={() => handlePayment("Gold")}
              className="w-full mt-auto bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              Select Gold
            </Button>
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
