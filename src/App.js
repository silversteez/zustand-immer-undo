import "./styles.css";
import { useStore } from "./use-store";

function AppComp() {
  console.count("app render");
  const state = useStore();
  return (
    <div className="App">
      <h1>Count: {state.count}</h1>
      <button
        onClick={() => {
          state.inc();
        }}
      >
        Increment
      </button>
      <button disabled={!state.canUndo} onClick={() => state.undo()}>
        Undo
      </button>
      <button disabled={!state.canRedo} onClick={() => state.redo()}>
        Redo
      </button>
    </div>
  );
}

// Making sure changes to unused store state don't cause re-render in this component
function ChildComp() {
  console.count("child render");
  const state = useStore();
  return (
    <div>
      <p>Another Component</p>
      <p>{state.deep.deeper}</p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <AppComp />
      <ChildComp />
    </>
  );
}
