import { Router } from "express";
import {
  getItem,
  getItemFilters,
  getItemPackContents,
  getItems
} from "../controllers/itemController.js";
import { validateItemListQuery } from "../middleware/validateItemListQuery.js";

const itemRoutes = Router();

itemRoutes.get("/meta", getItemFilters);
itemRoutes.get("/", validateItemListQuery, getItems);
itemRoutes.get("/:key/pack-contents", getItemPackContents);
itemRoutes.get("/:key", getItem);

export { itemRoutes };
