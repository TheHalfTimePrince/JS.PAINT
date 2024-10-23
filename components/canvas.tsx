"use client";
import React from "react";
import { useFabricCanvas } from "@/lib/hooks/canvas/useFabricCanvas";
import LoadingDots from "./ui/loading-dots";

declare global {
  var canvas: any;
}

export const Canvas = React.forwardRef<
  any,
  { 
    onLoad?(canvas: any): void;
    Toolbar?: React.ComponentType<{ canvas: any }>;
  }
>(({ onLoad, Toolbar }, ref) => {
  const { canvas, canvasRef, canvasParentRef } = useFabricCanvas(onLoad);

  React.useImperativeHandle(ref, () => canvas!, [canvas]);
  return (
    <div className="relative w-full h-full" ref={canvasParentRef}>
      <canvas className="" ref={canvasRef} />
      {!canvas ? (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
          <LoadingDots />
        </div>
      ) : (
        Toolbar && <Toolbar canvas={canvas} />
      )}
    </div>
  );
});