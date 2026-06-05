import {useUser} from "@clerk/react";
import {SIDE_MENU_DATA} from "../assets/data.js";
import {useNavigate} from "react-router-dom";

const SideMenu = ({activeMenu}) => {
    const {user} = useUser();
    const navigate = useNavigate();

    const initial = (user?.firstName?.[0] || user?.fullName?.[0] || "U").toUpperCase();

    return (
        <div className="w-64 h-[calc(100vh-61px)] bg-espresso border-r border-espresso-light p-5 sticky top-[61px] z-20">

            <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-8">
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-terracotta to-terracotta-dark ring-2 ring-terracotta/30 shadow-sm">
                    <span className="text-3xl font-semibold text-cream font-serif">{initial}</span>
                </div>
                <h5 className="text-cream font-medium leading-6 font-serif">
                    {user?.fullName || ""}
                </h5>
            </div>

            {SIDE_MENU_DATA.map((item, index) => (
                <button
                    key={`menu_${index}`}
                    className={`w-full flex items-center gap-4 text-[15px] py-3 px-5 rounded-lg mb-2 transition-all duration-200 cursor-pointer ${activeMenu == item.label ? "bg-terracotta text-white font-medium shadow-sm": "text-cream/70 hover:bg-espresso-light hover:text-cream"}`}
                    onClick={() => navigate(item.path)}
                >
                    <item.icon size={20} />
                    {item.label}
                </button>
            ))}
        </div>

    )
}

export default SideMenu;
