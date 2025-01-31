import {
  LocutusWsApi,
  PutResponse,
  GetResponse,
  UpdateResponse,
  UpdateNotification,
  Key,
  HostError,
} from "locutus-stdlib/src/webSocketInterface";
import "./scss/styles.scss";
// import * as bootstrap from 'bootstrap'

function getDocument(): Document {
  if (document) {
    return document;
  } else {
    throw new Error("document not present");
  }
}
const DOCUMENT: Document = getDocument();

const MODEL_CONTRACT = "DCBi7HNZC3QUZRiZLFZDiEduv5KHgZfgBk8WwTiheGq1";
const KEY = Key.fromSpec(MODEL_CONTRACT);

function getState(hostResponse: GetResponse) {
  console.log("Received get");
  let decoder = new TextDecoder("utf8");
  let currentStateBox = DOCUMENT.getElementById(
    "current-state"
  ) as HTMLPreElement;
  let state = decoder.decode(Uint8Array.from(hostResponse.state));
  currentStateBox.textContent = JSON.stringify(
    JSON.parse(state),
    ["messages", "author", "date", "title", "content"],
    2
  );
}

function getUpdateNotification(notification: UpdateNotification) {
  let decoder = new TextDecoder("utf8");
  let updatesBox = DOCUMENT.getElementById("updates") as HTMLPreElement;
  let new_update = decoder.decode(Uint8Array.from(notification.update));
  let new_update_json = JSON.parse(new_update.replace("\x00", ""));
  let new_content = JSON.stringify(
    new_update_json,
    ["author", "title", "content", "mod_msg", "signature"],
    2
  );

  updatesBox.textContent = updatesBox.textContent + new_content;
}

async function sendUpdate() {
  let input = DOCUMENT.getElementById("input") as null | HTMLTextAreaElement;
  let sendVal: HTMLTextAreaElement;
  if (!input) {
    throw new Error();
  } else {
    sendVal = input;
  }

  if (isValidUpdate(sendVal.value)) {
    let encoder = new TextEncoder();
    let updateRequest = {
      key: KEY,
      delta: encoder.encode("[" + sendVal.value + "]"),
    };
    await locutusApi.update(updateRequest);
  }
}

function isValidUpdate(input: string): boolean {
  const expected_keys = new Set(["author", "date", "title", "content"]);
  try {
    let input_json = JSON.parse(input);

    if (Array.isArray(input_json)) {
      return false;
    }

    let keys_set = new Set(Object.keys(input_json));
    if (keys_set.size !== expected_keys.size) {
      alert("The input json does not contain the expected keys");
      return false;
    }

    for (let key of expected_keys) {
      if (!keys_set.has(key)) {
        alert("The input key" + key + "does not exist");
        return false;
      }
    }

    return true;
  } catch (e) {
    alert("Invalid json: " + input);
    return false;
  }
}

function registerUpdater() {
  let updateBtn = DOCUMENT.getElementById("su-btn");
  if (!updateBtn) throw new Error();
  else updateBtn.addEventListener("click", sendUpdate);
}

function registerGetter() {
  let getBtn = DOCUMENT.getElementById("ls-btn");
  if (!getBtn) throw new Error();
  else getBtn.addEventListener("click", loadState);
}

async function subscribeToUpdates() {
  console.log(`subscribing to contract: ${MODEL_CONTRACT}`);
  await locutusApi.subscribe({
    key: KEY,
  });
  console.log(`sent subscription request to key: '${KEY.encode()}'`);
}

const handler = {
  onPut: (_response: PutResponse) => {},
  onGet: getState,
  onUpdate: (_up: UpdateResponse) => {},
  onUpdateNotification: getUpdateNotification,
  onErr: (err: HostError) => {
    console.log("Received error, cause: " + err.cause);
  },
  onOpen: () => {
    registerUpdater();
    registerGetter();
    subscribeToUpdates();
  },
};

const API_URL = new URL(`ws://${location.host}/contract/command/`);
const locutusApi = new LocutusWsApi(API_URL, handler);

async function loadState() {
  let getRequest = {
    key: Key.fromSpec(MODEL_CONTRACT),
    fetch_contract: false,
  };
  await locutusApi.get(getRequest);
}

window.addEventListener("load", function (_ev: Event) {
  loadState();
});
