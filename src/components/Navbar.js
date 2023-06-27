"use client";

import Link from "next/link";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Avatar, Button, Dropdown, Navbar } from "flowbite-react";
import ThemeSelector from "@/components/ui/ThemeSelector";

const NavbarComponent = () => {
    const supabase = createClientComponentClient();
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [userLoaded, isUserLoaded] = useState(false);

    async function loadUser() {
        const {
            data: { user: _user },
            error,
        } = await supabase.auth.getUser();
        setUser(_user);
        isUserLoaded(true);
    }

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.refresh();
        // router.push("/");
    };

    useEffect(() => {
        loadUser();
    }, [supabase]);

    function getInitials(name) {
        if (!name || name.length == 0) return;
        const nameArray = name.split(" ");
        const firstNameIn = nameArray[0].charAt(0).toUpperCase();
        const lastNameIn = nameArray[nameArray.length - 1].charAt(0).toUpperCase();
        return firstNameIn + lastNameIn;
    }

    return (
        <>
            <Navbar
                fluid
                rounded
                className="bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900"
            >
                <Navbar.Brand href="/" className="z-20">
                    <ArrowPathIcon className="mr-3 h-6 sm:h-8 fill-current text-blue-600 dark:text-white" />
                    <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
                        Ground Work
                    </span>
                </Navbar.Brand>
                <div className="flex z-20 md:order-2">
                    <ThemeSelector />
                    {userLoaded && (
                        <>
                            {!user ? (
                                <Button href="/login">Login</Button>
                            ) : (
                                <>
                                    <Dropdown
                                        inline
                                        label={
                                            <Avatar
                                                alt="User settings"
                                                img={user?.user_metadata?.avatar_url}
                                                rounded
                                                placeholderInitials={getInitials(
                                                    user.user_metadata?.full_name
                                                )}
                                            />
                                        }
                                    >
                                        <Dropdown.Header>
                                            <span className="block text-sm">
                                                {user.user_metadata?.full_name}
                                            </span>
                                            <span className="block truncate text-xs font-medium">
                                                {user?.email}
                                            </span>
                                        </Dropdown.Header>
                                        <Dropdown.Item>
                                            <Link href="/contractor/dashboard">Dashboard</Link>
                                        </Dropdown.Item>
                                        <Dropdown.Divider />
                                        <Dropdown.Item>
                                            <button onClick={() => signOut()}>Sign out</button>
                                        </Dropdown.Item>
                                    </Dropdown>
                                    <Navbar.Toggle />
                                </>
                            )}
                        </>
                    )}
                </div>
                {user && (
                    <Navbar.Collapse className="z-20">
                        <Navbar.Link href="/contractor/register">Register Business</Navbar.Link>
                        <Navbar.Link href="/contractor/dashboard">Dashboard</Navbar.Link>
                    </Navbar.Collapse>
                )}
            </Navbar>
        </>
    );
};

export default NavbarComponent;
