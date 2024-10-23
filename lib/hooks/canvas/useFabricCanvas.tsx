'use client'
import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric-with-erasing";

const DEV_MODE = process.env.NODE_ENV === "development";

export function useFabricCanvas(onLoad?: (canvas:any) => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasParentRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<any | null>(null);

  useEffect(() => {
    console.log(canvas, canvasRef, canvasParentRef);
  }, [canvas, canvasRef, canvasParentRef]);

  useEffect(() => {
    if (!canvasRef.current) return;

    fabric.fabric.Object.prototype.set({
        borderColor: "#FF8000",   // Customize the bounding box color
        cornerColor: "#FF8000",  // Customize the corner handles color
        cornerSize: 16,       // Customize the size of corner handles
        cornerStyle: 'circle' // Customize the corner handle shape
      });

    const newCanvas = new fabric.fabric.Canvas(canvasRef.current, {
      selectionBorderColor: "#FF8000",
      selectionColor: "#FF800056",
      altActionKey: "shiftKey",
      centeredRotation: true,
      backgroundColor: "white",
    });
    setCanvas(newCanvas);

    if (DEV_MODE) {
      (window as any).canvas = newCanvas;
    }

    onLoad?.(newCanvas);

    return () => {
      if (DEV_MODE) {
        delete (window as any).canvas;
      }
      newCanvas.dispose();
    };
  }, [onLoad]);

  useEffect(() => {
    if (!canvasParentRef.current || !canvas) return;

    const resizeCanvas = () => {
      const { width, height } = canvasParentRef.current!.getBoundingClientRect();
      canvas.setDimensions({ width, height });
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvasParentRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [canvas]);

  return { canvas, setCanvas, canvasRef, canvasParentRef };
}