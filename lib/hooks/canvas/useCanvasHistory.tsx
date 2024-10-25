import { useState, useCallback, useEffect, useRef } from "react";

const useCanvasHistory = (canvas: any) => {
  const [canvasStates, setCanvasStates] = useState<string[]>([]);
  const currentStateIndexRef = useRef<number>(-1);
  const isUndoingRedoingRef = useRef<boolean>(false);
  const [currentStateIndex, setCurrentStateIndex] = useState(0);

  const canUndo = currentStateIndex > 0;
  const canRedo = currentStateIndex < canvasStates.length - 1;

  const updateCanvasState = useCallback(() => {
    if (isUndoingRedoingRef.current) return;

    const jsonData = JSON.stringify(canvas.toJSON());
    setCanvasStates((prevStates) => {
      const newStates = [...prevStates.slice(0, currentStateIndexRef.current + 1), jsonData];
      currentStateIndexRef.current = newStates.length - 1;
      setCurrentStateIndex(currentStateIndexRef.current); 
      return newStates;
    });
  }, [canvas]);

  const undo = useCallback(() => {
    if (canUndo) {
      isUndoingRedoingRef.current = true;
      currentStateIndexRef.current -= 1;
      setCurrentStateIndex(currentStateIndexRef.current); 
      canvas.loadFromJSON(JSON.parse(canvasStates[currentStateIndexRef.current]), () => {
        canvas.renderAll();
        isUndoingRedoingRef.current = false;
      });
    }
  }, [canvas, canvasStates, canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      isUndoingRedoingRef.current = true;
      currentStateIndexRef.current += 1;
      setCurrentStateIndex(currentStateIndexRef.current); 
      canvas.loadFromJSON(JSON.parse(canvasStates[currentStateIndexRef.current]), () => {
        canvas.renderAll();
        isUndoingRedoingRef.current = false;
      });
    }
  }, [canvas, canvasStates, canRedo]);

  useEffect(() => {
    if (canvas) {
      const initialState = JSON.stringify(canvas.toJSON());
      setCanvasStates([initialState]);
      currentStateIndexRef.current = 0;
      setCurrentStateIndex(0);

      const handleStateUpdate = () => {
        if (!isUndoingRedoingRef.current) updateCanvasState();
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

  return { undo, redo, canUndo, canRedo };
};

export default useCanvasHistory;
