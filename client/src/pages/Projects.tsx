import { use, useEffect, useRef, useState } from "react";
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
 controllers-or-stripe-add
import { api } from "../lib/api";
import { toast } from "sonner";
import ProjectPreview, { type ProjectPreviewRef } from "../components/ProjectPreview";
import { useSession } from "../lib/auth-client";

import ProjectPreview, { type ProjectPreviewRef } from "../components/ProjectPreview";
import api from "@/configs/axios";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
 main


const Projects = () => {
  const { projectId } = useParams(); // ✅ FIXED
  const navigate = useNavigate();
 controllers-or-stripe-add
  const { data: session, isPending: sessionPending } = useSession();

  const { data: session ,isPending } = authClient.useSession();
 main

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const [isGenerating, setIsGenerating] = useState(true);
  const [device, setdevice] = useState<"phone" | "tablet" | "desktop">(
    "desktop"
  );

  const [isMenueOpen, setIsMenueOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const previewRef = useRef<ProjectPreviewRef>(null)

  const fetchProject = async () => {
    try {
 controllers-or-stripe-add
      const { data } = await api.get(`/api/projects/${projectId}`);
      setProject(data.project);
      
      const generating = !data.project.current_code;
      setIsGenerating(generating);
      
      if (generating) {
        // Polling if still generating
        setTimeout(fetchProject, 5000);
      }
    } catch (error: any) {
      toast.error("Failed to load project");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveproject = async () => {
    if (!project || isSaving) return;
    setIsSaving(true);
    try {
      const currentCode = previewRef.current?.getCode() || project.current_code;
      await api.post(`/api/projects/${projectId}/save`, { code: currentCode });
      toast.success("Project saved");
    } catch (error) {
      toast.error("Failed to save project");
    } finally {
      setIsSaving(false);
    }

      const {data} = await api.get(`/api/user/project/${projectId}`)
      setProject(data.project)
      setIsGenerating(data.project.current_code ? false : true)
      setLoading(false)
    }catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
    }};

  const saveproject = async () => {
      if (!previewRef.current) return;
      const code=previewRef.current.getCode();
      if(!code)return;
      setIsSaving(true);
      try{
        const {data}=await api.put(`/api/project/save/${projectId}`,{code})
        toast.success(data.messsage)
      }catch(error:any){

        toast.error(error?.response?.data?.message || error.message);
        console.log(error);
      }finally{
        setIsSaving(false)
      }

 main
  };
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
controllers-or-stripe-add
    try {
      const { data } = await api.get(`/api/projects/${projectId}/toggle-publish`);
      setProject(prev => prev ? { ...prev, isPublished: data.isPublished } : null);
      toast.success(data.message);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };
  useEffect(() => {
    if (session) {
      fetchProject();
    } else if (!sessionPending) {
        setLoading(false);
    }
  }, [session, sessionPending]);

    try{
        const {data}=await api.get(`/api/user/publish-toggle/${projectId}`)
        toast.success(data.messsage)
        setProject((prev)=>prev ? ({...prev,isPublished: !prev.isPublished}):null)
      }catch(error:any){
        toast.error(error?.response?.data?.message || error.message);
        console.log(error);
    }
  };
  useEffect(() =>{
    if(session?.user){
      fetchProject();
    }else if(!isPending && !session?.user){
      navigate("/")
      toast("Please sign in to view your projects")
    }
  },[session?.user])


  useEffect(() => {
    if(project && !project.current_code){
      const intervalId = setInterval(fetchProject,10000);
      return () => clearInterval(intervalId);
    }
  }, [project]);
 main

  if (loading || sessionPending) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
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
            src="/favicon.svg"
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
  ) : !session ? (
     <div className="flex flex-col items-center justify-center h-screen bg-black text-center px-4">
        <h1 className="text-3xl font-semibold text-gray-200">
          Login Required
        </h1>
        <p className="text-gray-500 mt-4 max-w-sm">
          You must be logged in to access the website builder and view your projects.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-8 px-8 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-medium transition"
        >
          Go Back Home
        </button>
     </div>
  ) : (
    <div className="flex items-center justify-center h-screen bg-black">
      <p className="text-2xl font-medium text-gray-200">
        Project not found
      </p>
    </div>
  );
};

export default Projects;
