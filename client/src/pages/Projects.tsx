import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Project } from "../types";
import Sidebar from "../components/Sidebar";
import {
  ArrowBigRightDashIcon,
  EyeIcon,
  EyeOffIcon,
  Fullscreen,
  LaptopIcon,
  Loader2Icon,
  MessageSquareIcon,
  SaveIcon,
  SmartphoneIcon,
  TabletIcon,
  XIcon,
} from "lucide-react";
import { dummyConversations, dummyProjects, dummyVersion } from "../assets/assets";
import ProjectPreview, { type ProjectPreviewRef } from "../components/ProjectPreview";


const Projects = () => {
  const { projectId } = useParams(); // ✅ FIXED
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const [isGenerating, setIsGenerating] = useState(true);
  const [device, setdevice] = useState<"phone" | "tablet" | "desktop">(
    "desktop"
  );

  const [isMenueOpen, setIsMenueOpen] = useState(false);
  const [isSaving] = useState(false);

  const previewRef = useRef<ProjectPreviewRef>(null)

  useEffect(() => {
    const fetchProject = async () => {
      const foundProject = dummyProjects.find(
        (project) => project.id === projectId
      );

      setTimeout(() => {
        if (foundProject) {
          setProject({
            ...foundProject,
            conversation: dummyConversations,
            versions: dummyVersion
          });
          setIsGenerating(foundProject.current_code ? false : true);
        }
        setLoading(false); // ✅ Always stop loading
      }, 2000);
    };
    fetchProject();
  }, [projectId]);

  const saveproject = async () => {

  }
  // download code (index.html)
  const downloadcode = () => {
    const code = previewRef.current?.getCode() || project?.current_code;
    if (!code) {
      if (isGenerating) {
        return
      }
      return
    }
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'index.html' });
    element.href = URL.createObjectURL(file)
    element.download = "index.html";
    document.body.appendChild(element)
    element.click();
  }

  const togglepublish = async () => {

  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2Icon className="size-7 animate-spin text-violet-200" />
      </div>
    );
  }

  return project ? (
    <div className="flex flex-col h-screen w-full bg-gray-900 text-white">
      {/* builder navbar */}
      <div className="flex max-sm:flex-col sm:items-center gap-4 px-4 py-2">
        {/* left */}
        <div className="flex items-center gap-2 min-w-[90px] text-nowrap">
          <img
            src="/fevicon.svg"
            alt="logo"
            className="h-6 cursor-pointer"
            onClick={() => navigate("/")}
          />
          <div className="max-w-xs">
            <p className="text-sm font-medium capitalize truncate">
              {project.name}
            </p>
            <p className="text-xs text-gray-400 -mt-0.5">
              Previewing last saved version
            </p>
          </div>

          <div className="sm:hidden flex-1 flex justify-end">
            {isMenueOpen ? (
              <XIcon
                onClick={() => setIsMenueOpen(false)}
                className="size-6 cursor-pointer"
              />
            ) : (
              <MessageSquareIcon
                onClick={() => setIsMenueOpen(true)}
                className="size-6 cursor-pointer"
              />
            )}
          </div>
        </div>

        {/* middle */}
        <div className="hidden sm:flex gap-2 bg-gray-950 p-1.5 rounded-md">
          <SmartphoneIcon
            onClick={() => setdevice("phone")}
            className={`size-6 p-1 rounded cursor-pointer ${device === "phone" ? "bg-gray-700" : ""
              }`}
          />
          <TabletIcon
            onClick={() => setdevice("tablet")}
            className={`size-6 p-1 rounded cursor-pointer ${device === "tablet" ? "bg-gray-700" : ""
              }`}
          />
          <LaptopIcon
            onClick={() => setdevice("desktop")}
            className={`size-6 p-1 rounded cursor-pointer ${device === "desktop" ? "bg-gray-700" : ""
              }`}
          />
        </div>

        {/* right */}
        <div className="flex items-center justify-end gap-3 flex-1 text-xs sm:text-sm">
          <button
            onClick={saveproject} disabled={isSaving}
            className="max-sm:hidden bg-gray-800 hover:bg-gray-700 text-white px-3.5 py-1 flex items-center gap-2 rounded border border-gray-700"
          >
            {isSaving ? (
              <Loader2Icon className="animate-spin" size={16} />
            ) : (
              <SaveIcon size={16} />
            )}
            Save
          </button>

          <Link
            target="_blank"
            to={`/preview/${projectId}`} // ✅ FIXED
            className="flex items-center gap-2 px-4 py-1 rounded border border-gray-700 hover:border-gray-500"
          ><Fullscreen size={16} />
            Preview
          </Link>

          <button onClick={downloadcode} className="bg-gradient-to-br from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white px-3.5 py-1 flex items-center gap-2 rounded">
            <ArrowBigRightDashIcon size={16} /> Download
          </button>

          <button onClick={togglepublish} className="bg-gradient-to-br from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white px-3.5 py-1 flex items-center gap-2 rounded">
            {project.isPublished ? (
              <EyeOffIcon size={16} />
            ) : (
              <EyeIcon size={16} />
            )}
            {project.isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-auto">
        <Sidebar isMenuOpen={isMenueOpen}
          Project={project}
          SetProject={(p) => setProject(p)}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating} />

        <div className="flex-1 p-2 pl-0">
          <ProjectPreview ref={previewRef} project={project} isGenerating={isGenerating}
            device={device} />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <p className="text-2xl font-medium text-gray-200">
        Unable to load project
      </p>
    </div>
  );
};

export default Projects;
