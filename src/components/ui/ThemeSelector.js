import { Menu } from "@headlessui/react";
import { ComputerDesktopIcon, MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function ThemeSelector({}) {
    const { theme, setTheme, resolvedTheme } = useTheme();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <>
            <div className="relative lg:mt-2">
                <Menu>
                    <Menu.Button>
                        {resolvedTheme === "dark" ? (
                            <MoonIcon className="h-5 w-5 fill-current text-gray-300 focus:outline-none dark:text-gray-200" />
                        ) : (
                            <SunIcon className="h-5 w-5 fill-current text-indigo-500 focus:outline-none dark:text-gray-200" />
                        )}
                    </Menu.Button>
                    <div className="absolute right-0 z-10 lg:right-auto lg:-left-12">
                        <Menu.Items
                            as="div"
                            className="mt-2 flex flex-col divide-y divide-gray-100 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-100 lg:mt-6"
                        >
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={() => setTheme("light")}
                                        className={`flex items-center px-6 py-2 dark:text-gray-800 ${
                                            active ? "bg-yellow-300" : ""
                                        }`}
                                    >
                                        <SunIcon className="mr-2 h-5 w-5 fill-current text-indigo-500 focus:outline-none dark:text-gray-800" />
                                        Light
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={() => setTheme("dark")}
                                        className={`flex items-center px-6 py-2 dark:text-gray-800 ${
                                            active ? "bg-yellow-300" : ""
                                        }`}
                                    >
                                        <MoonIcon className="mr-2 h-5 w-5 fill-current text-indigo-500 focus:outline-none dark:text-gray-800" />
                                        Dark
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={() => setTheme("system")}
                                        className={`flex items-center px-6 py-2 dark:text-gray-800 ${
                                            active ? "bg-yellow-300" : ""
                                        }`}
                                    >
                                        <ComputerDesktopIcon className="mr-2 h-5 w-5 fill-current text-indigo-500 focus:outline-none dark:text-gray-800" />
                                        System
                                    </button>
                                )}
                            </Menu.Item>
                        </Menu.Items>
                    </div>
                </Menu>
            </div>
        </>
    );
}
