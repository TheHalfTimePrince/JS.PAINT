"use client";
import React, { useState, useEffect } from "react";
import PopoverSlider from "../ui/popover-slider";
import { Button } from "../ui/button";
import * as fabric from "fabric-with-erasing";
import { Slider } from "../ui/slider";
import { Circle, Triangle, Square, Pentagon, Hexagon } from "lucide-react";
const ShapeSelect = ({
  canvas,
  color,
  Trigger,
}: {
  canvas: fabric.fabric.Canvas;
  color: string;
  Trigger: React.JSX.Element;
}) => {
  const [sides, setSides] = useState(0);
  const [shapePath, setShapePath] = useState("");
  const [useStroke, setUseStroke] = useState(false);
  useEffect(() => {
    setShapePath(generateShapePath(sides));
  }, [sides]);

  const generateShapePath = (sides: number): string => {
    const radius = 40; // Adjust this if needed for better scaling
    const centerX = 50;
    const centerY = 50;

    if (sides === 0) {
      return `M${centerX},${centerY} m${-radius},0 a${radius},${radius} 0 1,0 ${
        radius * 2
      },0 a${radius},${radius} 0 1,0 ${-radius * 2},0`;
    }

    let path = `M${centerX + radius * Math.cos(-Math.PI / 2)},${
      centerY + radius * Math.sin(-Math.PI / 2)
    } `;

    for (let i = 1; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      path += `L${x},${y} `;
    }

    return path + "Z";
  };

  const addShapeToCanvas = () => {
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <path d="${shapePath}" />
      </svg>
    `;

    fabric.fabric.loadSVGFromString(svgString, (objects, options) => {
      const shape = fabric.fabric.util.groupSVGElements(objects, options);
      shape.set({
        left: canvas.width! / 2,
        top: canvas.height! / 2,
        fill: useStroke ? "transparent" : color,
        stroke: useStroke ? color : "transparent",
        strokeWidth: useStroke ? 2 : 0,
      });
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
    });
  };

  const toggleStrokeFill = () => {
    setUseStroke(!useStroke);
  };

  const getSidesIcon = (sides: number) => {
    const className = `w-5 h-5 ${
      useStroke ? "stroke-current" : "fill-current"
    }`;
    switch (sides) {
      case 0:
        return <Circle className={className} />;
      case 3:
        return <Triangle className={className} />;
      case 4:
        return <Square className={className} />;
      case 5:
        return <Pentagon className={className} />;
      case 6:
        return <Hexagon className={className} />;
      default:
        return <Hexagon className={className} />;
    }
  };
  return (
    <PopoverSlider Trigger={Trigger}>
      <div className="w-full flex flex-col justify-center items-center pt-20 md:pt-0">
        <div className="w-full ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            width="100"
            height="100"
            className="mx-auto mb-4 cursor-pointer"
            onClick={addShapeToCanvas}
          >
            <path
              d={shapePath}
              fill={useStroke ? "none" : color}
              stroke={useStroke ? color : "none"}
              strokeWidth={useStroke ? 2 : 0}
            />
          </svg>

          <div className=" flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Button onClick={toggleStrokeFill} className="flex items-center">
                {getSidesIcon(sides)}
              </Button>
            </label>
            <Slider
              className="flex-grow"
              min={0}
              max={12}
              step={1}
              value={[sides]}
              onValueChange={(value) => {
                if (value[0] !== 1 && value[0] !== 2) setSides(value[0]);
              }}
            />
          </div>
        </div>
      </div>
    </PopoverSlider>
  );
};

export default ShapeSelect;
