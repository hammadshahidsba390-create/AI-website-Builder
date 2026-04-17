import { useEffect, useState } from "react";
import type { Project } from "../types";
import { Loader2Icon, PlusIcon, TrashIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dummyProjects } from "../assets/assets";
import Footer from "../components/Footer";
import api from "@/configs/axios";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const Myprojects = () => {
  const {data:session,isPending}=authClient.useSession();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  const fetchProjects = async () => {
   try{
    const {data}=await api.get('/api/user/projects')
    setProjects(data.projects)
    setLoading(false)
   }catch(error:any){
    console.log(error);
    toast.error(error?.response?.data?.message || error.message);
   }
  };

  const togglePublish = async (projectId: string) => {
    try {
      const { data } = await api.get(`/api/user/publish-toggle/${projectId}`);
      toast.success(data.message);
      fetchProjects();
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const confirm = window.confirm('Are you sure you want to delete this project? This action cannot be undone.');
      if (!confirm) return;
      const { data } = await api.delete(`/api/project/${projectId}`);
      toast.success(data.message);
      fetchProjects();
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if(session?.user && !isPending){
      fetchProjects();
    }else if(!isPending && !session?.user){
      navigate('/');
      toast('please login to view your projects')
    }
  }, [session?.user]);

  return (
    <>
      <div className="px-4 md:px-16 lg:px-24 xl:px-32 bg-black min-h-screen text-white">
        {loading ? (
          <div className="flex items-center justify-center h-[80vh]">
            <Loader2Icon className="size-7 animate-spin text-indigo-400" />
          </div>
        ) : projects.length > 0 ? (
          <div className="py-12 min-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <h1 className="text-3xl font-semibold">My Projects</h1>

              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-5 py-2 rounded-lg 
                bg-gradient-to-r from-indigo-500 to-purple-600 
                hover:opacity-90 active:scale-95 transition"
              >
                <PlusIcon size={18} />
                Create New
              </button>
            </div>

            {/* Projects Grid */}
            <div className="flex flex-wrap gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="relative group w-80 max-sm:mx-auto cursor-pointer 
                  bg-gray-900 border border-gray-800 rounded-xl overflow-hidden 
                  shadow-md hover:shadow-indigo-700/20 
                  hover:border-indigo-600/50 transition-all duration-300"
                >
                  {/* Preview */}
                  <div className="relative w-full h-44 bg-gray-950 border-b border-gray-800 overflow-hidden">
                    {project.current_code ? (
                      <iframe
                        srcDoc={project.current_code}
                        className="absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left pointer-events-none"
                        sandbox="allow-scripts allow-same-origin"
                        style={{ transform: "scale(0.26)" }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No Preview</p>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${project.isPublished ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-800/80 text-gray-400 border border-gray-700'}`}>
                      {project.isPublished ? 'Published' : 'Private'}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h2 className="text-lg font-semibold">
                      {project.name}
                    </h2>

                    <p className="text-gray-400 mt-2 text-sm line-clamp-2">
                      {project.initial_prompt}
                    </p>

                    {/* Bottom Section */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex justify-between items-center mt-6"
                    >
                      <span className="text-sm text-gray-500">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>

                      <div className="flex gap-2 text-sm">
                        <button
                          onClick={() => togglePublish(project.id)}
                          className={`px-3 py-1.5 rounded-md transition ${project.isPublished ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30'}`}
                        >
                          {project.isPublished ? 'Unpublish' : 'Publish'}
                        </button>

                        <button
                          onClick={() => window.open(`/view/${project.id}`, '_blank')}
                          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-md transition"
                          title="Open in New Tab"
                        >
                          View
                        </button>

                        <button
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-600/30 rounded-md transition"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <TrashIcon
                      onClick={() => deleteProject(project.id)}
                      className="absolute top-3 right-3 scale-0 group-hover:scale-100 
                      bg-gray-800 p-1.5 size-7 rounded-lg text-red-500 
                      hover:bg-red-600 hover:text-white cursor-pointer transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <h1 className="text-3xl font-semibold text-gray-400">
              You Have No Projects Yet
            </h1>

            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition"
            >
              Create New
            </button>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default Myprojects;
