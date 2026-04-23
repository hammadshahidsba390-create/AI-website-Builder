import { useEffect, useState, version } from "react";
import { useParams } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
 controllers-or-stripe-add
import type { Project } from "../types";
import { api } from "../lib/api";

const Preview = () => {

import type { Project, Version } from "../types";
import api from "@/configs/axios";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const Preview = () => {

  const {data:session,isPending}=authClient.useSession();
 main
  const { projectId, versionId } = useParams()
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCode = async () => {
 controllers-or-stripe-add
    try {
      const { data } = await api.get(`/api/projects/public/${projectId}`);
      
      // If a specific versionId was requested, find that version's code
      if (versionId && data.project?.versions) {
        const version = data.project.versions.find((v: any) => v.id === versionId);
        if (version) {
          setCode(version.code);
        } else {
          setCode(data.code);
        }
      } else {
        setCode(data.code);
      }
    } catch (error) {
      console.error('Failed to load preview:', error);
    } finally {
      setLoading(false);

    try{
      const {data}=await api.get(`/api/project/preview/${projectId}`);
      setCode(data.project.current_code);
      if(versionId){
        data.project.version.forEach((versio:Version)=>{
          if(versio.id===versionId){
            setCode(versio.code)
          }
        })
      }
      setLoading(false)
    }catch(error:any){
      toast.error(error?.response?.data?.message || error.message)
      console.log(error);
 main
    }
  }

  useEffect(() => {
    if(!isPending && session?.user){
      fetchCode()
    }
    
  }, [session?.user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2Icon className="size-7 animate-spin text-indigo-200" />
      </div>
    )
  }

  return (
    <div className="h-screen">
      {code ? (
        <ProjectPreview project={{ current_code: code } as Project}
          isGenerating={false} showEditorPanel={false} />
      ) : (
        <div className="flex items-center justify-center h-screen text-gray-400">
          <p>Project not found or not available.</p>
        </div>
      )}
    </div>
  )
}

export default Preview