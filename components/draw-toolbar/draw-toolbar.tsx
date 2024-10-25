"use client";
import * as fabric from "fabric-with-erasing";
import {
  Pencil,
  MousePointer2,
  Palette,
  Eraser,
  Pen,
  PenTool,
  Ruler,
  RefreshCcw,
  Download,
  Trash,
  Image,
  Undo2,
  Redo2,
  PaintBucket,
  Origami,
  Smile,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import ColorSelect from "./color-select";
import SizeSelect from "./size-select";
import ShapeSelect from "./shape-select";
import IconSelect from "./icon-select";
import useCanvasHistory from "@/lib/hooks/canvas/useCanvasHistory";

export const DrawToolbar = ({ canvas }: { canvas: fabric.fabric.Canvas }) => {
  const [selectedTool, setSelectedTool] = useState("select");
  const [color, setColor] = useState("#FF8000");
  const [size, setSize] = useState(5);
  const [backgroundColor, setBackgroundColor] = useState("white");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { undo, redo, canUndo, canRedo } = useCanvasHistory(canvas);
  // Enable path drawing tool
  // State for line drawing
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [tempLine, setTempLine] = useState<fabric.fabric.Line | null>(null);

  // Enable line drawing mode
  const enablePenTool = () => {
    setSelectedTool("pen");
    setIsDrawingLine(true);
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.defaultCursor = createCustomCursor(
      0,
      "#000000",
      color,
      size / 2
    );
  };

// Update event listeners in useEffect
useEffect(() => {
  const handleMouseDown = (event: fabric.fabric.IEvent) => {
    if (selectedTool !== "pen" || !isDrawingLine) return;
    if (!event.pointer) return;
    const { x, y } = event.pointer;
    const newLine = new fabric.fabric.Line([x, y, x, y], {
      stroke: color,
      strokeWidth: size,
      selectable: false,
    });
    setTempLine(newLine);
    canvas.add(newLine);
  };

  const handleMouseMove = (event: fabric.fabric.IEvent) => {
    if (!isDrawingLine || !tempLine) return;
    if (!event.pointer) return;
    const { x, y } = event.pointer;
    tempLine.set({ x2: x, y2: y });
    canvas.renderAll();
  };

  const handleMouseUp = () => {
    if (!isDrawingLine || !tempLine) return;
    setTempLine(null); // Clear temp line reference
    setIsDrawingLine(true); // Reset to allow another line
    canvas.renderAll();
  };
  

  canvas.on("mouse:down", handleMouseDown);
  canvas.on("mouse:move", handleMouseMove);
  canvas.on("mouse:up", handleMouseUp);

  return () => {
    canvas.off("mouse:down", handleMouseDown);
    canvas.off("mouse:move", handleMouseMove);
    canvas.off("mouse:up", handleMouseUp);
  };
}, [canvas, selectedTool, isDrawingLine, color, size, tempLine]);
  

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && canvas) {
      const reader = new FileReader();
      reader.onload = (e) => {
        fabric.fabric.Image.fromURL(e.target?.result as string, (img) => {
          img.scaleToWidth(200); // Adjust this value as needed
          canvas.add(img);
          canvas.centerObject(img);
          canvas.renderAll();
        });
      };
      reader.readAsDataURL(file);
    }
  };
  useEffect(() => {
    if (canvas) {
      canvas.setBackgroundColor(backgroundColor, canvas.renderAll.bind(canvas));
    }
  }, [canvas, backgroundColor]);

  const [startPoint, setStartPoint] = useState<fabric.fabric.Point | null>(
    null
  );
  // Enable drawing mode with a pencil tool
  const enableDrawing = () => {
    setSelectedTool("pencil");
    canvas.isDrawingMode = true;
    const pencilBrush = new fabric.fabric.PencilBrush(canvas);
    pencilBrush.width = size;
    pencilBrush.color = color;
    canvas.freeDrawingCursor = createCustomCursor(
      0,
      "#000000",
      color,
      size / 2
    );
    canvas.freeDrawingBrush = pencilBrush;
  };

  const createCustomCursor = useCallback(
    (
      strokeWidth: number,
      strokeColor: string,
      fillColor: string,
      size: number
    ) => {
      const padding = 0; // Ensure minimum padding of 2px
      const cursorSize = Math.max(size * 2, 2) + padding * 2; // Add padding to both sides
      const halfCursorSize = cursorSize / 2;
      const cursorCanvas = document.createElement("canvas");
      cursorCanvas.width = cursorSize;
      cursorCanvas.height = cursorSize;
      const ctx = cursorCanvas.getContext("2d");
      if (ctx) {
        // Draw a filled square to set a base
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, cursorSize, cursorSize);

        // Set composite mode to cut out a circle
        ctx.globalCompositeOperation = "destination-in";
        ctx.beginPath();
        const radius = Math.max(size, 1);
        ctx.arc(halfCursorSize, halfCursorSize, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        // Reset composite operation to default
        ctx.globalCompositeOperation = "source-over";
      }

      return `url(${cursorCanvas.toDataURL()}) ${halfCursorSize} ${halfCursorSize}, auto`;
    },
    []
  );

  const clearCanvas = () => {
    canvas.clear();
    canvas.setBackgroundColor("white", canvas.renderAll.bind(canvas));
  };

  const downloadCanvas = () => {
    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
    });

    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Enable selection mode (disable drawing)
  const enableSelection = () => {
    setSelectedTool("select");
    canvas.isDrawingMode = false;
    canvas.selection = true; // Enable selection of objects
  };

  // Enable eraser functionality
  const enableEraser = () => {
    setSelectedTool("eraser");
    canvas.isDrawingMode = true;

    // Use custom eraser brush logic compatible with Fabric.js v5
    const eraserBrush = new (fabric.fabric as any).EraserBrush(canvas);
    eraserBrush.width = size; // Set the eraser width
    canvas.freeDrawingCursor = createCustomCursor(
      4,
      "#FF8000",
      backgroundColor,
      size / 2
    );
    canvas.freeDrawingBrush = eraserBrush;
  };

  // Update the free drawing brush color when the color changes
  useEffect(() => {
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
      if (selectedTool === "pencil") {
        canvas.freeDrawingCursor = createCustomCursor(
          0,
          "#000000",
          color,
          size / 2
        );
      }
    }
  }, [color, canvas]);

  useEffect(() => {
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = size;
    }
    if (selectedTool === "pencil") {
      canvas.freeDrawingCursor = createCustomCursor(
        0,
        "#000000",
        color,
        size / 2
      );
    }
    if (selectedTool === "eraser") {
      canvas.freeDrawingCursor = createCustomCursor(
        4,
        "#FF8000",
        backgroundColor,
        size / 2
      );
    }
    if (selectedTool === "pen") {
      canvas.defaultCursor = createCustomCursor(
        0,
        "#000000",
        color,
        size / 2
      );
    }
  }, [size, canvas]);

  return (
    <div className="absolute w-full h-full pointer-events-none inset-0 left-0 p-2">
      <div className="w-full flex items-center justify-center">
        <div className=" flex space-x-2 items-center justify-center">
          <button
            onClick={downloadCanvas}
            className={`p-2 text-white bg-green-500 hover:bg-green-600 rounded-full shadow-md pointer-events-auto `}
          >
            <Download size={24} />
          </button>
          <button
            onClick={clearCanvas}
            className={`p-2 text-white bg-red-500 hover:bg-red-600 rounded-full shadow-md pointer-events-auto `}
          >
            <Trash size={24} />
          </button>
        </div>
        <div className=" flex space-x-2 items-center justify-center ml-8">
          <button
            onClick={enableSelection}
            className={`p-2 bg-white border-2  rounded-full shadow-md pointer-events-auto hover:bg-gray-100 ${
              selectedTool === "select" ? "text-primary" : ""
            }`}
          >
            <MousePointer2 size={24} />
          </button>

          <button
            onClick={enableDrawing}
            className={`p-2 bg-white border-2  rounded-full shadow-md pointer-events-auto hover:bg-gray-100 ${
              selectedTool === "pencil" ? "text-primary" : ""
            }`}
          >
            <Pencil size={24} />
          </button>
          <button
            onClick={enablePenTool}
            className={`p-2 bg-white border-2  rounded-full shadow-md pointer-events-auto hover:bg-gray-100 ${
              selectedTool === "pen" ? "text-primary" : ""
            }`}
          >
            <PenTool size={24} />
          </button>
          <button
            onClick={enableEraser}
            className={`p-2 bg-white  border-2  rounded-full shadow-md pointer-events-auto hover:bg-gray-100 ${
              selectedTool === "eraser" ? "text-primary" : ""
            }`}
          >
            <Eraser size={24} />
          </button>

          <button className="p-2 bg-white border-2  rounded-full shadow-md pointer-events-auto hover:bg-gray-100">
            <ShapeSelect
              canvas={canvas}
              color={color}
              Trigger={<Origami size={24} />}
            />
          </button>
          <button className="p-2 bg-white border-2  rounded-full shadow-md pointer-events-auto hover:bg-gray-100">
            <IconSelect
              canvas={canvas}
              color={color}
              Trigger={<Smile size={24} />}
            />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 bg-white border-2 rounded-full shadow-md pointer-events-auto hover:bg-gray-100`}
          >
            <Image size={24} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: "none" }}
          />
        </div>
        <div className=" flex space-x-2 items-center justify-center">
          <button className="p-2 bg-primary hover:bg-primary/80 pointer-events-auto text-background rounded-full ml-8 shadow-md ">
            <ColorSelect
              color={color}
              setColor={setColor}
              Trigger={<Palette size={24} />}
            />
          </button>

          <button className="p-2 bg-primary hover:bg-primary/80 pointer-events-auto text-background rounded-full ml-8 shadow-md ">
            <ColorSelect
              color={backgroundColor}
              setColor={setBackgroundColor}
              Trigger={<PaintBucket size={24} />}
            />
          </button>
          <button className="p-2 pointer-events-auto bg-primary hover:bg-primary/80 text-background rounded-full shadow-md ">
            <SizeSelect
              size={size}
              setSize={setSize}
              Trigger={<Ruler size={24} />}
            />
          </button>
        </div>
        <div className=" flex space-x-2 ml-2 items-center justify-center">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-2 bg-white border-2 rounded-full shadow-md pointer-events-auto hover:bg-gray-100 ${
              !canUndo ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Undo2 size={24} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-2 bg-white border-2 rounded-full shadow-md pointer-events-auto hover:bg-gray-100 ${
              !canRedo ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Redo2 size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
