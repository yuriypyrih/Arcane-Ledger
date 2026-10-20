import { createContext, useContext } from "react";
import type { ResourceManagementTarget } from "../../../pages/CharactersPage/resourceManagement";

type ResourceManager = (target: ResourceManagementTarget, trigger: HTMLButtonElement) => void;
export const DrawerResourceContext = createContext<ResourceManager | null>(null);
export const useDrawerResourceManagement = () => useContext(DrawerResourceContext);
