import {useContext, useEffect, useState} from "react";
import {Menu, Share2, X} from "lucide-react";
import {Link} from "react-router-dom";
import {Show, UserButton} from "@clerk/react";
import SideMenu from "./SideMenu.jsx";
import CreditsDisplay from "./CreditsDisplay.jsx";
import {UserCreditsContext} from "../context/UserCreditsContext.jsx";

const Navbar = ({activeMenu}) => {
    const [openSideMenu, setOpenSideMenu] = useState(false);
    const {credits, fetchUserCredits} = useContext(UserCreditsContext);

    useEffect(() => {
        fetchUserCredits();
    }, [fetchUserCredits]);

    return (
        <div className="flex items-center justify-between gap-5 bg-cream/90 border-b border-warmborder backdrop-blur-sm py-4 px-4 sm:px-7 sticky top-0 z-30">
            {/* Left side - menu button and title*/}
            <div className="flex items-center gap-5">
                <button
                    onClick={() => setOpenSideMenu(!openSideMenu)}
                    className="block lg:hidden text-espresso hover:bg-terracotta-soft p-1 rounded transition-colors">
                    {openSideMenu ? (
                        <X className="text-2xl" />
                    ): (
                        <Menu className="text-2xl" />
                    )}
                </button>

                <div className="flex items-center gap-2">
                    <Share2 className="text-terracotta" size={22} />
                    <span className="text-xl font-semibold text-espresso truncate font-serif">
                        Cloud Share
                    </span>
                </div>
            </div>

            {/* Right side - credits and user button*/}
            <Show when="signed-in">
                <div className="flex items-center gap-4">
                    <Link to="/subscriptions">
                        <CreditsDisplay credits={credits} />
                    </Link>
                    <div className="relative">
                        <UserButton />
                    </div>
                </div>
            </Show>

            {/* Mobile side menu */}
            {openSideMenu && (
                <div className="fixed top-[73px] left-0 right-0 bg-cream border-b border-warmborder lg:hidden z-20">
                    {/* Side menu bar */}
                    <SideMenu activeMenu={activeMenu}/>
                </div>
            )}
        </div>
    )
}

export default Navbar;
