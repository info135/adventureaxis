"use client";

import { MenuContext } from "./MenuContext";

export function MenuProvider({ children, menuItems }) {
    return (
        <MenuContext.Provider value={menuItems}>
            {children}
        </MenuContext.Provider>
    );
}
