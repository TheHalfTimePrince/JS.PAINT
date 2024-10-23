"use client";
import React from "react";
import PopoverSlider from "../ui/popover-slider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { HexColorPicker } from "react-colorful";
const ColorSelect = ({
  color,
  setColor,
  Trigger,
}: {
  color: string;
  setColor: (color: string) => void;
  Trigger: React.JSX.Element;
}) => {
  return (
    <PopoverSlider Trigger={Trigger}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full flex flex-col justify-center items-center pt-20 md:pt-0"
      >

        <HexColorPicker color={color} onChange={setColor} />
        <div className="flex flex-col px-0  ">
          <div className="relative ">
            <span
              className="absolute left-2 pt-4 top-1/2 transform -translate-y-1/2 max-w-64"
              style={{ color: "black" }}
            >
              #
            </span>
            <Input
              className="pl-6 text-base max-w-48 mt-4  "
              style={{ backgroundColor: "white", color: "black" }}
              value={color.replace("#", "")}
              onChange={(e) => {
                e.stopPropagation();
                const value = e.target.value;
                if (/^[0-9A-Fa-f]{0,6}$/.test(value)) {
                  setColor(`#${value}`);
                }
              }}
              maxLength={6}
            />
          </div>
        </div>
      </div>
    </PopoverSlider>
  );
};

export default ColorSelect;
