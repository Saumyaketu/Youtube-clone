import React from "react";
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

  if (!isOpen) return null;

  const handlePayment = async () => {
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
        description: "Unlimited Downloads Plan",
        order_id: order_id,
        handler: async function (response: any) {
          const data = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            userId: user._id,
          };

          const result = await axiosInstance.post("/payment/verify", data);
          if (result.data.isPremium) {
            alert("Welcome to Premium! You can now download unlimited videos.");
            login({ ...user, isPremium: true });
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

        <h2 className="text-2xl font-bold mb-4">Upgrade to Premium</h2>
        <div className="mb-6 space-y-3">
          <p className="text-gray-600">
            You've reached your daily download limit.
          </p>
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-lg mb-2">Premium Plan</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> Unlimited Downloads
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> Ad-free experience
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> Priority Support
              </li>
            </ul>
            <div className="mt-4 text-xl font-bold">
              ₹500{" "}
              <span className="text-sm font-normal text-gray-500">
                / lifetime
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          Get Premium
        </Button>
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
