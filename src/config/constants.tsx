import { PIXEL_WIDTH } from "./dimensions";

export const DEFAULT_EXPIRE_TIME = 60*24*60*60*1000; //60 days (also remove)

export const METERING_INTERVAL_DURATION = 500;
export const INITIAL_CLIP_TIME = 20000;
export const CLIP_LENGTH = 2.5*60000;
export const CLIP_ACCURACY = 6000;

export const EXTRA_CHAIN_LENGTH = 10;
export const MAX_SAVED_CHAIN_LENGTH = 10;
export const MAX_VIRTUAL_CHAIN_LENGTH = 2 * EXTRA_CHAIN_LENGTH;

export const CHAIN_HEIGHT = 65;
export const INPUT_PANEL_HEIGHT = 150;
export const ACTION_BAR_HEIGHT = 50;
export const STATIC_ACTIVATOR_HEIGHT = INPUT_PANEL_HEIGHT + ACTION_BAR_HEIGHT;

export const MESSAGE_SPACER = 12;
export const MESSAGE_HEIGHT = 50;
export const MESSAGE_MAX_WIDTH = 150;
export const MESSAGE_MIN_WIDTH = 60 + MESSAGE_SPACER;
export const DATE_INDICATOR_WIDTH = 60;

export const CHAIN_METERS_WIDTH = 6;

export const DEFAULT_LEFT_PLACEHOLDER_PADDING = PIXEL_WIDTH;
export const INITIAL_LEFT_PADDING = 100000;
export const GET_EXTRA_THRESHOLD = 400;
export const NEGATIVE_TRESHOLD_LIMIT = 50;
