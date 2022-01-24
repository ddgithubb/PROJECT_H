
const ASSETS_PATH = "../../assets/icons/"
const ACTIONS_PATH = ASSETS_PATH + "Actions/"

//Main icons
export const REJECT_RESOURCE = require(ASSETS_PATH + "reject.png");
export const CHECK_RESOURCE = require(ASSETS_PATH + "check-grey.png");
export const SEARCH_MORE_RESOURCE = require(ASSETS_PATH + "search-more.png"); //#202020
export const BACK_RESOURCE = require(ASSETS_PATH + "back.png");
export const CANCEL_RESOURCE = require(ASSETS_PATH + "cancel.png");
export const SEND_RESOURCE = require(ASSETS_PATH + "send.png");
export const SEND_DISABLED_RESOURCE = require(ASSETS_PATH + "send-disabled.png");
export const MICROPHONE_RESOURCE = require(ASSETS_PATH + "microphone.png");
export const REDO_RESOURCE = require(ASSETS_PATH + "redo.png"); //not in use
export const MORE_INFO_RESOURCE = require(ASSETS_PATH + "more-info.png"); //not in use
export const SEE_MORE_RESOURCE = require(ASSETS_PATH + "see_more.png"); //not in use
export const LINE_MORE_RESOURCE = require(ASSETS_PATH + "line-more.png");
export const ARROW_MORE_RESOURCE = require(ASSETS_PATH + "arrow.png");
export const VOICE_WAVES = require(ASSETS_PATH + "voice-waves.png");

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