"use client";

import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { BoardColumn } from "./BoardColumn";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const COLUMNS = [
  { id: "saved", title: "Saved" },
  { id: "applied", title: "Applied" },
  { id: "interview", title: "Interview" },
  { id: "offer", title: "Offer" },
  { id: "rejected", title: "Rejected" },
];

export function Board({ initialJobs }: { initialJobs: any[] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const router = useRouter();

  // Optimistic UI update
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // 1. Update local state immediately
    const movedJob = jobs.find(j => j._id === draggableId);
    if (!movedJob) return;

    const newStatus = destination.droppableId;
    const updatedJobs = jobs.map(job => 
       job._id === draggableId ? { ...job, status: newStatus } : job
    );
    
    setJobs(updatedJobs);

    // 2. Persist to backend
    try {
      const res = await fetch(`/api/jobs/${draggableId}`, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
         throw new Error("Failed to update status");
      }
      
      toast.success(`Moved to ${COLUMNS.find(c => c.id === newStatus)?.title}`);
      router.refresh(); 
    } catch (error) {
      toast.error("Failed to save changes");
      // Revert state if needed (omitted for brevity)
    }
  };
  
  // Group jobs by status
  const getJobsByStatus = (status: string) => {
     return jobs.filter(job => job.status === status);
  };

  return (
    <div className="h-[calc(100vh-140px)] overflow-x-auto pb-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 h-full min-w-max">
          {COLUMNS.map((col) => (
            <BoardColumn
              key={col.id}
              id={col.id}
              title={col.title}
              jobs={getJobsByStatus(col.id)}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
