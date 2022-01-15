import { PIXEL_HEIGHT, PIXEL_WIDTH } from "../config/dimensions";

const PROFILE_MAX_HEIGHT = 160;

export const COLUMN_AMOUNT = Math.floor((PIXEL_WIDTH - (20)) / PROFILE_MAX_HEIGHT);
export const REQUEST_ROW_AMOUNT = Math.floor(PIXEL_HEIGHT / 100)
export const ITEM_DIMENSION = Math.floor((PIXEL_WIDTH - 20) / COLUMN_AMOUNT);
const ROW_AMOUNT = Math.ceil(PIXEL_HEIGHT / 150);
export const RENDER_AMOUNT = COLUMN_AMOUNT * ROW_AMOUNT;