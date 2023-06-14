"use client";

import { Menu, Transition } from "@headlessui/react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRightOnRectangleIcon, UserIcon } from "@heroicons/react/24/solid";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect } from "react";

export default function ({ user, setUser, ...rest }) {
    const supabase = createClientComponentClient();
    const router = useRouter();

    const signOut = async (e) => {
        e.preventDefault();
        await supabase.auth.signOut();
        setUser({});
        router.push("/");
    };

    return (
        <div className="relative">
            <Menu>
                {({ open }) => (
                    <>
                        <span className="rounded-md shadow-sm">
                            <Menu.Button className="block h-8 w-8 overflow-hidden rounded-full border-2 border-indigo-400 hover:shadow-md focus:outline-none">
                                {user?.user?.user_metadata?.avatar_url ? (
                                    <img
                                        src={user?.user?.user_metadata?.avatar_url}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <UserIcon className="fill-current text-indigo-700 focus:outline-none dark:text-gray-200" />
                                )}
                            </Menu.Button>
                        </span>

                        <Transition
                            show={open}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <div className="absolute right-0 lg:right-auto lg:-left-28">
                                <Menu.Items
                                    as="div"
                                    className="mt-2 flex flex-col divide-y divide-gray-100 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-100 lg:mt-6"
                                >
                                    <div className="px-6 py-3">
                                        <p className="text-sm leading-5 text-gray-800">
                                            Signed in as
                                        </p>
                                        <p className="truncate text-sm font-medium leading-5 text-gray-800">
                                            {user?.user?.user_metadata?.full_name ||
                                                user?.user?.email}
                                        </p>
                                    </div>

                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={signOut}
                                                className={`flex items-center px-4 py-2 dark:text-gray-800 ${
                                                    active ? "bg-yellow-300" : ""
                                                }`}
                                            >
                                                <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5 fill-current text-gray-800 focus:outline-none dark:text-gray-800" />
                                                Sign out
                                            </button>
                                        )}
                                    </Menu.Item>
                                </Menu.Items>
                            </div>
                        </Transition>
                    </>
                )}
            </Menu>
        </div>
    );
}
