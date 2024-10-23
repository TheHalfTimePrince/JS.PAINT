"use client";
import { useState, useEffect } from "react";
import MaxWidthWrapper from "../max-width-wrapper";
import { createPortal } from "react-dom";
import { useMediaQuery } from "usehooks-ts";
import { motion } from "framer-motion";
import { ChevronLeft, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";


interface ModalProps {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  Trigger: React.JSX.Element;
  disabled?: boolean;
}

export const PopoverSlider: React.FC<ModalProps> = ({
  children,
  className,
  open: externalOpen,
  setOpen: externalSetOpen,
  Trigger,
  disabled,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen =
    externalSetOpen !== undefined ? externalSetOpen : setInternalOpen;
  const [isVisible, setIsVisible] = useState(open);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const internalOnExit = () => {
    
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 350);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    const scrollJuice = document.getElementById("scroll-juice");
    const overflowValue = open ? "hidden" : "auto";

    if (scrollJuice) {
      scrollJuice.style.overflow = overflowValue;
    }

    document.body.style.overflow = overflowValue;
  }, [open]);



  if (isMobile) {
    return (
      <>
        <div onClick={() => setOpen(!open)}>{Trigger}</div>

        {isVisible && createPortal(
          <MaxWidthWrapper>
            <motion.div
              className="fixed inset-0 w-full h-screen max-h-screen bg-white z-[100]"
              initial={{ x: "100%" }}
              animate={{ x: open ? 0 : "100%" }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              onAnimationComplete={() => {
                if (!open) internalOnExit?.();
              }}
            >
              <div className="h-full flex flex-col">
                <button
                  onClick={internalOnExit}
                  type="button"
                  className="self-start mt-4 ml-4 mb-4 p-2 hover:bg-neutral-200 text-neutral-700 rounded-none flex items-center space-x-2"
                >
                  <ChevronLeft className="h-6 w-6" />
                  <span className="sr-only">Close panel</span>
                </button>

                <div
                  className="w-full h-full overflow-auto p-8 px-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {children}
                </div>
              </div>
            </motion.div>
          </MaxWidthWrapper>,
          document.body
        )}
      </>
    );
  } else {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div onClick={() => setOpen(false)}>{Trigger}</div>
        </PopoverTrigger>
        <PopoverContent>{children}</PopoverContent>
      </Popover>
    );
  }
};

export default PopoverSlider;
