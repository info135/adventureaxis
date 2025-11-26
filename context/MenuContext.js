"use client";

import { createContext, useContext } from "react";

export const MenuContext = createContext([]);

export const useMenu = () => useContext(MenuContext);
