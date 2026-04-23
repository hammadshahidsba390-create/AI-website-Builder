import React, { useEffect, useRef, useState } from "react";
import type { Project, Version, Message } from "../types";
import {
  BotIcon,
  EyeIcon,
  Loader2Icon,
  SendIcon,
  UserIcon,
  Layout,
} from "lucide-react";
import { Link } from "react-router-dom";
 controllers-or-stripe-add
import { api } from "../lib/api";

import api from "@/configs/axios";
 main
import { toast } from "sonner";

interface SidebarProps {
  isMenuOpen: boolean;
  Project: Project;
  SetProject: (project: Project) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

const Sidebar = ({
  isMenuOpen,
  Project,
controllers-or-stripe-add

  SetProject,
 main
  isGenerating,
  setIsGenerating,
}: SidebarProps) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const fetchProject = async () => {
    try{
      const {data} = await api.get(`/api/user/project/${Project.id}`)
      SetProject(data.project)
    }catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
    }
  }

  const handleRollback = async (versionId: string) => {
    try {
 controllers-or-stripe-add
      await api.post(`/api/projects/${Project.id}/rollback/${versionId}`);
      toast.success('Rolled back successfully');
      window.location.reload();
    } catch {
      toast.error('Rollback failed');

      const confirm=window.confirm("Are you sure you want to rollback to this version")
      if(!confirm)return;
      setIsGenerating(true)
      const {data}=await api.get(`/api/project/rollback/${Project.id}/${versionId}`)
      const {data:data2}=await api.get(`/api/user/project/${Project.id}`)
      toast.success(data.message)
      SetProject(data2.project)
      setIsGenerating(false)
    }catch (error: any) {
      setIsGenerating(false)
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
 main
    }
  };

  const handleRevesion = async (e: React.FormEvent) => {
    e.preventDefault()
 controllers-or-stripe-add
    if (!input.trim()) return;
    setIsGenerating(true)
    try {
      await api.post(`/api/projects/${Project.id}/revision`, { message: input });
      setInput("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false)

    let interval:number | undefined;
    try {
      setIsGenerating(true);
      interval=setInterval(() => {
        fetchProject();
      },10000)
      const {data}=await api.post(`/api/project/revision/${Project.id}`,{message:input})
      fetchProject();
      toast.success('data.message')
      setInput("");
      clearInterval(interval)
      setIsGenerating(false);
    }catch(error: any){
      setIsGenerating(false);
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
      clearInterval(interval);
 main
    }
  }

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [Project.conversation.length, isGenerating]);

  return (
    <div
      className={`h-full sm:w-85 backdrop-blur-xl bg-black/40 border-r border-white/10 transition-all duration-500 
      ${isMenuOpen ? 'max-sm:w-0 overflow-hidden' : "w-full"}`}
    >
      <div className="flex flex-col h-full">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-8 flex flex-col gap-6">
          <div className="mb-4">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 opacity-50">Operation Log</span>
          </div>

          {[...Project.conversation, ...Project.versions]
            .sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            )
            .map((message) => {
              const isMessage = "content" in message;

              if (isMessage) {
                const msg = message as Message;
                const isUser = msg.role === "user";

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-3 ${isUser ? "justify-end" : "justify-start"
                      }`}
                  >
                    {!isUser && (
                      <div className="size-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <BotIcon className="size-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] px-5 py-3 rounded-2xl text-[13px] leading-relaxed font-medium transition-all ${isUser
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-xl shadow-indigo-500/10"
                        : "rounded-tl-none bg-white/5 border border-white/10 text-gray-200"
                        }`}
                    >
                      {msg.content}
                    </div>

                    {isUser && (
                      <div className="size-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                        <UserIcon className="size-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                );
              } else {
                const ver = message as Version;

                return (
                  <div
                    key={ver.id}
                    className="w-full p-4 rounded-3xl bg-white/5 border border-white/10 shadow-sm flex flex-col gap-4 group hover:border-indigo-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                         <Layout size={18} />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-white uppercase tracking-widest">Snapshot Created</p>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                          {new Date(ver.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {Project.current_version_index === ver.id ? (
                        <div className="flex-1 px-4 py-2 text-[10px] bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl font-black uppercase tracking-widest text-center">
                          Active Branch
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRollback(ver.id)}
                          className="flex-1 px-4 py-2 text-[10px] bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                        >
                          Rollback
                        </button>
                      )}

                      <Link
                        target="_blank"
                        to={`/preview/${Project.id}/${ver.id}`}
                        className="size-10 flex items-center justify-center bg-white/5 border border-white/10 hover:border-indigo-500/30 rounded-xl transition-all"
                      >
                        <EyeIcon className="size-4 text-gray-400 hover:text-white" />
                      </Link>
                    </div>
                  </div>
                );
              }
            })}

          {isGenerating && (
            <div className="flex items-start gap-3 justify-start animate-fade-in">
              <div className="size-8 rounded-xl bg-indigo-600/20 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                <BotIcon className="size-4 text-indigo-400 animate-pulse" />
              </div>
              <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-2xl rounded-tl-none flex gap-1.5 h-full items-center">
                <span className="size-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="size-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="size-1.5 bg-indigo-400 rounded-full animate-bounce" />
              </div>
            </div>
          )}

          <div ref={messageRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 pt-2 border-t border-white/5 bg-black/20">
          <form onSubmit={handleRevesion} className="relative">
            <textarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
              rows={3}
              placeholder="Inject new directives..."
              className="w-full p-5 pr-14 rounded-[2rem] resize-none text-[13px] font-medium outline-none bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500/50 transition-all shadow-inner"
              disabled={isGenerating}
            />

            <button 
              disabled={isGenerating || !input.trim()}
              className="absolute bottom-3 right-3 size-11 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all disabled:opacity-30 active:scale-90 shadow-xl shadow-indigo-500/30"
            >
              {isGenerating ? (
                <Loader2Icon className="size-5 animate-spin" />
              ) : (
                <SendIcon className="size-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
