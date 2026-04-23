import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project } from "../types";
import { api } from "../lib/api";

const Preview = () => {
  const { projectId, versionId } = useParams()
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCode = async () => {
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