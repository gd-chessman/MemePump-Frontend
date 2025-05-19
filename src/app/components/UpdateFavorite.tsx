"use client";

import { Star } from "lucide-react";
import { useLang } from "@/lang";
import { useState } from "react";
import { SolonaTokenService } from "@/services/api";
import { ToastNotification } from "@/ui/toast";

interface UpdateFavoriteProps {
  token: {
    address: string;
    status?: boolean;
  };
  onSuccess?: () => void;
  onError?: () => void;
  className?: string;
}

export const UpdateFavorite = ({ token, onSuccess, onError, className = "" }: UpdateFavoriteProps) => {
  const { t } = useLang();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleStarClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const data = {
        token_address: token.address,
        status: token.status ? "off" : "on",
      };
      
      const response = await SolonaTokenService.toggleWishlist(data);
      
      if (response) {
        setToastMessage(t("trading.wishlistUpdated"));
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      setToastMessage(t("trading.wishlistError"));
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);

      // Call onError callback if provided
      if (onError) {
        onError();
      }
    }
  };

  return (
    <>
      <button
        onClick={handleStarClick}
        className={`cursor-pointer ${className}`}
      >
        <Star
          className={`h-4 w-4 ${
            token.status ? "text-yellow-500 fill-yellow-500" : "text-neutral-400"
          }`}
        />
      </button>
      
      {showToast && (
        <ToastNotification
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};
