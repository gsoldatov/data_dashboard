import { NavLink, useLocation } from "react-router-dom";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
    navigationMenuTriggerStyle,
} from "@/components/common/shadcn-ui/navigation-menu";

export const AdminNavbar = () => {
    const { pathname } = useLocation();

    return (
        <NavigationMenu className="mb-6">
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuLink
                        asChild
                        active={pathname === "/admin/etl"}
                        className={navigationMenuTriggerStyle()}
                    >
                        <NavLink to="/admin/etl">ETL</NavLink>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink
                        asChild
                        active={pathname === "/admin/visualizations"}
                        className={navigationMenuTriggerStyle()}
                    >
                        <NavLink to="/admin/visualizations">
                            Visualizations
                        </NavLink>
                    </NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
};
