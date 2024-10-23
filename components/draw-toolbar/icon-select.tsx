"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import PopoverSlider from "../ui/popover-slider";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import * as fabric from "fabric-with-erasing";
import dynamic from "next/dynamic";
import LoadingDots from "../ui/loading-dots";
import {
  CloudLightning,
  Feather,
  Sun,
  Circle,
  Square,
  Search,
  Bolt,
  Zap,
} from "lucide-react";
import { Input } from "../ui/input";

// Define the libraries to dynamically load
const libraries = [
  {
    name: "Thin",
    key: "thin",
    icon: <Feather size={16} />,
    loader: () => import("../font-awesome/js/thin.js"),
  },
  {
    name: "Light",
    key: "light",
    icon: <Sun size={16} />,
    loader: () => import("../font-awesome/js/light.js"),
  },
  {
    name: "Regular",
    key: "regular",
    icon: <Circle size={16} />,
    loader: () => import("../font-awesome/js/regular.js"),
  },
  {
    name: "Solid",
    key: "solid",
    icon: <Square size={16} />,
    loader: () => import("../font-awesome/js/solid.js"),
  },
  {
    name: "Sharp Light",
    key: "sharp-light",
    icon: <Feather size={16} />,
    loader: () => import("../font-awesome/js/sharp-light.js"),
  },
  {
    name: "Sharp Regular",
    key: "sharp-regular",
    icon: <Sun size={16} />,
    loader: () => import("../font-awesome/js/sharp-regular.js"),
  },
  {
    name: "Sharp Solid",
    key: "sharp-solid",
    icon: <Circle size={16} />,
    loader: () => import("../font-awesome/js/sharp-solid.js"),
  },
  {
    name: "Sharp Thin",
    key: "sharp-thin",
    icon: <Square size={16} />,
    loader: () => import("../font-awesome/js/sharp-thin.js"),
  },
];

const IconSelect = ({
  color,
  canvas,
  Trigger,
}: {
  color: string;
  canvas: fabric.fabric.Canvas;
  Trigger: React.JSX.Element;
}) => {
  const [activeLibrary, setActiveLibrary] = useState(libraries[0].key); // Default to the first library
  const [icons, setIcons] = useState<any[]>([]);
  const [visibleIcons, setVisibleIcons] = useState<any[]>([]);
  const [isLoadingIcons, setIsLoadingIcons] = useState(true); // State for loading icons
  const [isLoadingButton, setIsLoadingButton] = useState(false); // State for loading button
  const [loadCount, setLoadCount] = useState(50); // Number of icons to load initially
  const loaderRef = useRef(null);
  const [isSharpMode, setIsSharpMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadIcons = async (libraryKey: string) => {
    setIsLoadingIcons(true);
    const selectedLibrary = libraries.find((lib) => lib.key === libraryKey);
    if (selectedLibrary) {
      const libraryIcons = (await selectedLibrary.loader()).default;
      setIcons(Object.entries(libraryIcons));
      setVisibleIcons(Object.entries(libraryIcons).slice(0, loadCount)); // Load only the first batch of icons initially
    }
    setIsLoadingIcons(false);
  };

  // Load icons for the default library (first one in the array) on initial load
  useEffect(() => {
    loadIcons(libraries[0].key);
  }, []);

  const adjustColorBrightness = (hexColor: string, factor: number) => {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const newR = Math.min(255, Math.floor(r * factor));
    const newG = Math.min(255, Math.floor(g * factor));
    const newB = Math.min(255, Math.floor(b * factor));

    return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB)
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
  };

  const addIconToCanvas = (iconName: string, iconData: any) => {
    const [width, height, , , path, secondPath] = iconData;

    let secondColor = color;

    if (activeLibrary === "duotone") {
      const lightnessFactor = 0.7; // Adjust this factor to control the lightness of the second color
      secondColor = adjustColorBrightness(color, lightnessFactor);
    }

    const svgString = secondPath
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
           <path d="${secondPath}" fill="${secondColor}"></path>
           <path d="${path}" fill="${color}"></path>
         </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="${color}">
           <path d="${path}"></path>
         </svg>`;

    fabric.fabric.loadSVGFromString(svgString, (objects, options) => {
      const icon = fabric.fabric.util.groupSVGElements(objects, options);
      icon.set({
        left: canvas.width! / 2,
        top: canvas.height! / 2,
      });
      canvas.add(icon);
      canvas.setActiveObject(icon);
      canvas.renderAll();
    });
  };

  const loadMoreIcons = useCallback(() => {
    setVisibleIcons((prevIcons) => [
      ...prevIcons,
      ...icons.slice(prevIcons.length, prevIcons.length + loadCount),
    ]);
  }, [icons, loadCount]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMoreIcons();
      }
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loadMoreIcons]);

  const handleLibraryChange = (libraryKey: string) => {
    setIsLoadingButton(true);
    const newKey = isSharpMode ? `sharp-${libraryKey}` : libraryKey;
    setActiveLibrary(newKey);
    loadIcons(newKey).finally(() => {
      setIsLoadingButton(false);
    });
  };

  const toggleSharpMode = () => {
    setIsSharpMode((prev) => !prev);
    const currentLibrary = libraries.find(
      (lib) => lib.key === activeLibrary.replace("sharp-", "")
    );
    if (currentLibrary) {
      handleLibraryChange(currentLibrary.key);
    }
  };

  const filteredIcons = useMemo(() => {
    if (!searchTerm.trim()) {
      return visibleIcons;
    }
    return icons.filter(([iconName]) =>
      iconName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [icons, visibleIcons, searchTerm]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <PopoverSlider Trigger={Trigger}>
      <div className="w-full flex flex-col justify-center items-center pt-20 md:pt-0">
        {/* Search input */}
        <div className="flex justify-center items-center pb-2 w-full px-2 pr-4 relative">
          <Input
            className="w-full rounded-full border-primary border-2 h-full shadow-md pl-8"
            placeholder="Search icons"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search
            size={16}
            className="absolute left-5 top-[14px] transform -translate-y-1/2 text-primary"
          />
        </div>
        <div className="grid grid-cols-5 gap-2 mb-4 px-2 pr-[1.125rem]">
          {libraries
            .filter((library) => !library.key.startsWith("sharp"))
            .map((library) => (
              <Button
                key={library.key}
                onClick={() => handleLibraryChange(library.key)}
                className={`px-4 py-2 font-bold shadow-md w-full ${
                  activeLibrary === `sharp-${library.key}` ||
                  activeLibrary === library.key
                    ? "bg-primary"
                    : "bg-white text-primary border-none hover:text-white"
                }`}
              >
                {isLoadingButton &&
                activeLibrary ===
                  (isSharpMode ? `sharp-${library.key}` : library.key) ? (
                  <LoadingDots color="#000" />
                ) : (
                  library.icon
                )}
              </Button>
            ))}
          {/* Add the Sharp switch button */}
          <Button
            onClick={toggleSharpMode}
            className={`px-4 py-2 font-bold rounded-full shadow-md ${
              isSharpMode
                ? "bg-primary"
                : "bg-white hover:text-white   text-primary border-none"
            }`}
          >
            <Zap size={16} />
          </Button>
        </div>

        {/* Scrollable icon list */}
        <ScrollArea className="h-64 w-full px-4">
          {isLoadingIcons ? (
            <div className="flex justify-center items-center h-full">
              <LoadingDots color="#000" />
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-4">
              {filteredIcons.map(([iconName, iconData]) => {
                const [width, height, , , path, secondPath] = iconData;

                return activeLibrary === "duotone" && secondPath ? (
                  <svg
                    key={iconName}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={`0 0 ${width} ${height}`}
                    className="cursor-pointer"
                    onClick={() => addIconToCanvas(iconName, iconData)}
                    width="20"
                    height="20"
                  >
                    <path
                      d={secondPath}
                      fill={adjustColorBrightness(color, 0.7)}
                    ></path>
                    <path d={path} fill={color}></path>
                  </svg>
                ) : (
                  <svg
                    key={iconName}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={`0 0 ${width} ${height}`}
                    className="cursor-pointer"
                    fill={color}
                    onClick={() => addIconToCanvas(iconName, iconData)}
                    width="20"
                    height="20"
                  >
                    <path d={path}></path>
                  </svg>
                );
              })}
            </div>
          )}
          {!searchTerm && <div ref={loaderRef} className="h-8"></div>}
        </ScrollArea>
      </div>
    </PopoverSlider>
  );
};

export default IconSelect;
