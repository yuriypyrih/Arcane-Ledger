import { Router } from "express";
import { getItem, getItemFilters, getItems } from "../controllers/itemController.js";
import { validateItemListQuery } from "../middleware/validateItemListQuery.js";

const itemRoutes = Router();

itemRoutes.get("/meta", getItemFilters);
itemRoutes.get("/", validateItemListQuery, getItems);
itemRoutes.get("/:key", getItem);

export { itemRoutes };
