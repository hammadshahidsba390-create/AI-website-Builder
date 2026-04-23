import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project } from "../types";
import { api } from "../lib/api";

const View = () => {
  const { projectId } = useParams();
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchCode = async () => {
    try {
      const { data } = await api.get(`/api/projects/public/${projectId}`);
      setCode(data.code);
    } catch (error) {
      console.error('Failed to load project view:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCode()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2Icon className="size-7 animate-spin text-indigo-200" />
      </div>
    )
  }

  return (
    <div className="w-full h-screen">
      {code ? (
        <ProjectPreview project={{ current_code: code } as Project}
          isGenerating={false} showEditorPanel={false} />
      ) : (
        <div className="flex items-center justify-center h-screen text-gray-400">
          <p>This project is not available or has been removed.</p>
        </div>
      )}
    </div>
  )
}

export default View