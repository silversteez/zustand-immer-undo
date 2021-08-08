import { produce, applyPatches, enablePatches } from "immer";
import create from "zustand";

enablePatches();

const DEBUG = false;
const changes = {};
const noOfVersionsSupported = 100;

let currentVersion = -1;
let recordUndos = true;

export const undoStore = (set) => ({
  undo: () => {
    recordUndos = false;
    set((state) => {
      applyPatches(state, changes[currentVersion--].undo);
      state.canUndo = changes.hasOwnProperty(currentVersion);
      state.canRedo = true;
    });
    recordUndos = true;
  },
  redo: () => {
    recordUndos = false;
    set((state) => {
      applyPatches(state, changes[++currentVersion].redo);
      state.canUndo = true;
      state.canRedo = changes.hasOwnProperty(currentVersion + 1);
    });
    recordUndos = true;
  },
  canUndo: false,
  canRedo: false
});

// Log every time state is changed
export const undoLoggingMiddleware = (config) => (set, get, api) =>
  config(
    (args) => {
      set(args);
      const { count, canUndo, canRedo } = get();
      if (DEBUG) {
        console.log("new state", { count, canUndo, canRedo });
      }
    },
    get,
    api
  );

const myPatchListener = (patches, inversePatches) => {
  if (!recordUndos) {
    return;
  }
  currentVersion++;

  changes[currentVersion] = {
    redo: patches,
    undo: inversePatches
  };

  delete changes[currentVersion + 1];
  delete changes[currentVersion - noOfVersionsSupported];

  if (DEBUG) {
    console.log("changes are", changes);
    console.log("currentversion is", currentVersion);
  }
};

// Turn the set method into an immer proxy
export const undoImmerMiddleware = (config) => (set, get, api) =>
  config(
    (fn) => {
      // Follow instructions here to create my own curried produce
      // so we can listen to patches
      // https://github.com/immerjs/immer/issues/178
      const curriedProduce = (state) =>
        produce(
          state,
          (draft) => {
            // Reset undo/redo after every action
            draft.canUndo = true;
            draft.canRedo = false;
            // Can override in the actual action as needed
            fn(draft);
          },
          myPatchListener
        );

      set(curriedProduce);
    },
    get,
    api
  );

export const createStoreWithUndo = (store) => {
  // Merge the passed in store with
  const mergedWithUndoStore = (set) => ({
    ...store(set),
    ...undoStore(set)
  });

  return create(
    undoLoggingMiddleware(undoImmerMiddleware(mergedWithUndoStore))
  );
};
