import { createStoreWithUndo } from "./zustand-undo";
import { createTrackedSelector } from "react-tracked";

const appStore = (set) => ({
  count: 0,
  deep: { deeper: "deeply nested string!" },
  inc: () => {
    set((state) => {
      state.count++;
    });
  },
  dec: () =>
    set((state) => {
      state.count--;
    })
});

const useStore = createStoreWithUndo(appStore);

// Add automatic dependency tracking
// https://react-tracked.js.org/docs/tutorial-zustand-01
// This just allows us to grab the whole state object during render
// and access any properties we want without having to use selector
// callbacks (and still get accurate dependency tracking for re-renders):
//  1. const state = useStore(); // then access state.firstName or anything else
//  2. const firstName = useStore((state) => state.firstName);
const useTrackedStore = createTrackedSelector(useStore);

export { useTrackedStore as useStore };
