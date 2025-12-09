import AppRouter from "./router/AppRouter";
import IncomingCallModal from "./components/calls/IncomingCallModal";
import CallScreen from "./components/calls/CallScreen";
import { useCall } from "./context/CallContext";

function App() {
  const { incomingCall, isCallUIOpen } = useCall();

  return (
    <>
      <AppRouter />
      {incomingCall && <IncomingCallModal />}
      {isCallUIOpen && <CallScreen />}
    </>
  );
}

export default App;
