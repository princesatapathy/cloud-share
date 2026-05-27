import {BrowserRouter, Route, Routes} from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Upload from "./pages/Upload.jsx";
import MyFiles from "./pages/MyFiles.jsx";
import Subscription from "./pages/Subscription.jsx";
import Transactions from "./pages/Transactions.jsx";
import {RedirectToSignIn, Show} from "@clerk/react";
import {Toaster} from "react-hot-toast";
import {UserCreditsProvider} from "./context/UserCreditsContext.jsx";
import PublicFileView from "./pages/PublicFileView.jsx";

const protectedRoute = (element) => (
    <Show when="signed-in" fallback={<RedirectToSignIn />}>
        {element}
    </Show>
);

const App = () => {
    return (
        <UserCreditsProvider>
            <BrowserRouter>
                <Toaster />
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/dashboard" element={
                        protectedRoute(<Dashboard />)
                    } />
                    <Route path="/upload" element={
                        protectedRoute(<Upload />)
                    } />
                    <Route path="/my-files" element={
                        protectedRoute(<MyFiles />)
                    } />
                    <Route path="/subscriptions" element={
                        protectedRoute(<Subscription />)
                    } />
                    <Route path="/transactions" element={
                        protectedRoute(<Transactions />)
                    } />
                    <Route path="file/:fileId" element={
                        <>
                            <PublicFileView />
                        </>
                    }/>
                    <Route path="/*" element={<RedirectToSignIn />} />
                </Routes>
            </BrowserRouter>
        </UserCreditsProvider>
    )
}

export default App;
