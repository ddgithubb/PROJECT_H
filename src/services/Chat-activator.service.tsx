import { CHAIN_METERS_WIDTH, GET_EXTRA_THRESHOLD, MESSAGE_MAX_WIDTH, MESSAGE_MIN_WIDTH } from "../config/constants";
import { PIXEL_WIDTH } from "../config/dimensions";

export const CHAIN_METER_AMOUNTS = Math.ceil(MESSAGE_MAX_WIDTH / CHAIN_METERS_WIDTH);

//export const MESSAGES_TO_LOAD = 4;
export const MESSAGES_TO_LOAD = Math.ceil((3 * PIXEL_WIDTH) / MESSAGE_MIN_WIDTH); //Only restrict audio and text messages?
export const MESSAGES_LOAD_LEFT = Math.floor(MESSAGES_TO_LOAD / 2);
export const MESSAGES_LOAD_RIGHT = MESSAGES_TO_LOAD - MESSAGES_LOAD_LEFT;

export const NO_LAST_SEEN_OFFSET = GET_EXTRA_THRESHOLD + (PIXEL_WIDTH / 4);
export const METERS_WIDTH = 4;

export const MEDIA_CURRENT_POS_EVENT_EMITTER = "MEDIA_CURRENT_POS";