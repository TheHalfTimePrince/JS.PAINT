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

export const DrawToolbar = ({ canvas }: { canvas: any }) => {
  const [selectedTool, setSelectedTool] = useState("select");
  const [color, setColor] = useState("#FF8000");
  const [size, setSize] = useState(5);
  const [backgroundColor, setBackgroundColor] = useState("white");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canvasStates, setCanvasStates] = useState<string[]>([]);
  const currentStateIndexRef = useRef<number>(-1);
  const isUndoingRedoingRef = useRef<boolean>(false);
  const [currentStateIndex, setCurrentStateIndex] = useState(0);

  // Enable path drawing tool
  const enablePenTool = () => {
    setSelectedTool("pen");
  };
  useEffect(() => {
    setCurrentStateIndex(currentStateIndexRef.current);
  }, [canvasStates, currentStateIndexRef.current]);

  const updateCanvasState = useCallback(() => {
    if (isUndoingRedoingRef.current) return; // Skip updating state if undoing or redoing

    const jsonData = JSON.stringify(canvas.toJSON());
    setCanvasStates((prevStates) => {
      const newStates = [
        ...prevStates.slice(0, currentStateIndexRef.current + 1),
        jsonData,
      ];
      currentStateIndexRef.current = newStates.length - 1;
      return newStates;
    });
  }, [canvas]);

  useEffect(() => {
    if (canvas) {
      // Save initial state
      const initialState = JSON.stringify(canvas.toJSON());
      setCanvasStates([initialState]);
      currentStateIndexRef.current = 0;

      const handleStateUpdate = () => {
        if (!isUndoingRedoingRef.current) {
          updateCanvasState();
        }
      };

      canvas.on("object:modified", handleStateUpdate);
      canvas.on("object:added", handleStateUpdate);
      canvas.on("object:removed", handleStateUpdate);

      return () => {
        canvas.off("object:modified", handleStateUpdate);
        canvas.off("object:added", handleStateUpdate);
        canvas.off("object:removed", handleStateUpdate);
      };
    }
  }, [canvas, updateCanvasState]);

  const canvasUndo = useCallback(() => {
    if (currentStateIndexRef.current > 0) {
      isUndoingRedoingRef.current = true;
      currentStateIndexRef.current -= 1;
      setCurrentStateIndex(currentStateIndexRef.current); // Update state
      canvas.loadFromJSON(
        JSON.parse(canvasStates[currentStateIndexRef.current]),
        () => {
          canvas.renderAll();
          isUndoingRedoingRef.current = false;
        }
      );
    }
  }, [canvas, canvasStates]);

  const canvasRedo = useCallback(() => {
    if (currentStateIndexRef.current < canvasStates.length - 1) {
      isUndoingRedoingRef.current = true;
      currentStateIndexRef.current += 1;
      setCurrentStateIndex(currentStateIndexRef.current); // Update state
      canvas.loadFromJSON(
        JSON.parse(canvasStates[currentStateIndexRef.current]),
        () => {
          canvas.renderAll();
          isUndoingRedoingRef.current = false;
        }
      );
    }
  }, [canvas, canvasStates]);

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
  const [isDrawingLine, setIsDrawingLine] = useState(false);
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
      const padding = Math.max(strokeWidth, 4); // Ensure minimum padding of 2px
      const cursorSize = Math.max(size * 2, 2) + padding * 2; // Add padding to both sides
      const halfCursorSize = cursorSize / 2;
      const cursorCanvas = document.createElement("canvas");
      cursorCanvas.width = cursorSize;
      cursorCanvas.height = cursorSize;
      const ctx = cursorCanvas.getContext("2d");

      if (ctx) {
        ctx.beginPath();
        const radius = Math.max(size, 1);
        ctx.arc(halfCursorSize, halfCursorSize, radius, 0, Math.PI * 2);

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();

        ctx.fillStyle = fillColor;
        ctx.fill();
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
          {/* <button
            onClick={enablePenTool}
            className={`p-2 bg-white border-2  rounded-full shadow-md pointer-events-auto hover:bg-gray-100 ${
              selectedTool === "pen" ? "text-primary" : ""
            }`}
          >
            <PenTool size={24} />
          </button> */}
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
            onClick={canvasUndo}
            disabled={currentStateIndexRef.current <= 0}
            className={`p-2 bg-white border-2 rounded-full shadow-md pointer-events-auto hover:bg-gray-100 ${
              currentStateIndexRef.current <= 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <Undo2 size={24} />
          </button>
          <button
            onClick={canvasRedo}
            disabled={currentStateIndex >= canvasStates.length - 1}
            className={`p-2 bg-white border-2 rounded-full shadow-md pointer-events-auto hover:bg-gray-100 ${
              currentStateIndex >= canvasStates.length - 1
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <Redo2 size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
