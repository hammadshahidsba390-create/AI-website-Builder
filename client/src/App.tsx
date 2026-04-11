import { Route, Routes, useLocation } from "react-router-dom";
import Pricing from "./pages/Pricing";
import Projects from "./pages/Projects";
import Myprojects from "./pages/Myprojects";
import Preview from "./pages/Preview";
import Community from "./pages/Community";
import Home from "./pages/Home";
import View from "./pages/View";
import Navbar from "./components/Navbar";

const App = () => {
  const { pathname } = useLocation();

  const hideNavbar =
    pathname.startsWith("/projects/") ||
    pathname.startsWith("/view/") ||
    pathname.startsWith("/preview/");

  return (
    <div className="min-h-screen bg-black text-white">
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/projects" element={<Myprojects />} />
        <Route path="/projects/:projectId" element={<Projects />} />
        <Route path="/preview/:projectId" element={<Preview />} />
        <Route path="/preview/:projectId/:versionId" element={<Preview />} />
        <Route path="/community" element={<Community />} />
        <Route path="/view/:projectId" element={<View />} />
      </Routes>
    </div>
  );
};

export default App;
