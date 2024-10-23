import { Canvas } from "@/components/canvas";
import Image from "next/image";
import { DrawToolbar } from "@/components/draw-toolbar/draw-toolbar";
export default function Home() {
  return (
    <div className="h-screen w-screen flex justify-center items-center ">
      <Canvas Toolbar={DrawToolbar} />
    </div>
  );
}
