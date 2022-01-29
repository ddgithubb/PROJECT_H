
const ICONS_PATH = "../../assets/icons/"
const ACTIONS_PATH = ICONS_PATH + "Actions/"

//Main icons
export const REJECT_ICON = require(ICONS_PATH + "reject.png");
export const CHECK_ICON = require(ICONS_PATH + "check-grey.png");
export const SEARCH_MORE_ICON = require(ICONS_PATH + "search-more.png"); //#202020
export const BACK_ICON = require(ICONS_PATH + "back.png");
export const CANCEL_ICON = require(ICONS_PATH + "cancel.png");
export const SEND_ICON = require(ICONS_PATH + "send.png");
export const SEND_DISABLED_ICON = require(ICONS_PATH + "send-disabled.png");
export const MICROPHONE_ICON = require(ICONS_PATH + "microphone.png");
export const MORE_INFO_ICON = require(ICONS_PATH + "more-info.png"); //not in use
export const SEE_MORE_ICON = require(ICONS_PATH + "see_more.png"); //not in use
export const LINE_MORE_ICON = require(ICONS_PATH + "line-more.png");
export const ARROW_MORE_ICON = require(ICONS_PATH + "arrow.png");
export const VOICE_WAVES_ICON = require(ICONS_PATH + "voice-waves.png");
export const PLAY_ICON = require(ICONS_PATH + "play.png");
export const PAUSE_ICON = require(ICONS_PATH + "pause.png");

//Action icons
export const HEART_ACTION_RESOURCE = require(ACTIONS_PATH + "heart.png"); //code 1
export const THUMBS_UP_ACTION_RESOURCE = require(ACTIONS_PATH + "thumbs_up.png"); //code 2
export const THUMBS_DOWN_ACTION_RESOURCE = require(ACTIONS_PATH + "thumbs_down.png"); //code 3
export const BALLOONS_ACTION_RESOURCE = require(ACTIONS_PATH + "balloons.png"); //code 4
export const SAD_FACE_ACTION_RESOURCE = require(ACTIONS_PATH + "sad_face.png"); //code 5
export const ACTIONS_RESOURCE = [
    HEART_ACTION_RESOURCE,
    THUMBS_UP_ACTION_RESOURCE,
    THUMBS_DOWN_ACTION_RESOURCE,
    BALLOONS_ACTION_RESOURCE,
    SAD_FACE_ACTION_RESOURCE,
]