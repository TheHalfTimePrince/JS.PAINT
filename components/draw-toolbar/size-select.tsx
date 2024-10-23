"use client";
import React from "react";
import PopoverSlider from "../ui/popover-slider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { HexColorPicker } from "react-colorful";
import { Slider } from "../ui/slider";
const SizeSelect = ({
  size,
  setSize,
  Trigger,
}: {
  size: number;
  setSize: (size: number) => void;
  Trigger: React.JSX.Element;
}) => {
  return (
    <PopoverSlider Trigger={Trigger}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full flex flex-col justify-center items-center pt-20 md:pt-0"
      >
        <Slider
          value={[size]}
          onValueChange={(value) => setSize(value[0])}
          min={1}
          max={100}
        />
      </div>
    </PopoverSlider>
  );
};

export default SizeSelect;
