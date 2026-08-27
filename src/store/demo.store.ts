import { create } from "zustand";
import { persist } from "zustand/middleware";
import { demoParticipant } from "../mocks";
import type { Participant, Photo, PublicationStatus } from "../types";

interface DemoState {
  participants: Participant[];
  photos: Photo[];
  currentParticipantId: string | null;
  selectedFrameId: string;
  draftPhoto: { raw: string; framed: string } | null;
  addParticipant: (participant: Participant) => void;
  updateParticipant: (participant: Participant) => void;
  selectParticipant: (id: string) => void;
  selectFrame: (id: string) => void;
  setDraftPhoto: (draft: { raw: string; framed: string } | null) => void;
  approvePhoto: (photo: Photo) => void;
  deletePhoto: (id: string) => void;
  updatePhoto: (id: string, values: Partial<Photo>) => void;
  setPublication: (id: string, status: PublicationStatus) => void;
  resetDemo: () => void;
}

const initial = {
  participants: [demoParticipant],
  photos: [] as Photo[],
  currentParticipantId: demoParticipant.id,
  selectedFrameId: "finisher",
  draftPhoto: null
};

export const useDemoStore = create<DemoState>()(
  persist(
    (set) => ({
      ...initial,
      addParticipant: (participant) => set((state) => ({ participants: [...state.participants, participant], currentParticipantId: participant.id })),
      updateParticipant: (participant) => set((state) => ({ participants: state.participants.map((item) => item.id === participant.id ? participant : item) })),
      selectParticipant: (id) => set({ currentParticipantId: id }),
      selectFrame: (id) => set({ selectedFrameId: id }),
      setDraftPhoto: (draftPhoto) => set({ draftPhoto }),
      approvePhoto: (photo) => set((state) => ({
        photos: [photo, ...state.photos],
        draftPhoto: null,
        participants: state.participants.map((participant) => participant.id === photo.participantId
          ? { ...participant, photosRemaining: Math.max(0, participant.photosRemaining - 1) }
          : participant)
      })),
      deletePhoto: (id) => set((state) => ({ photos: state.photos.filter((photo) => photo.id !== id) })),
      updatePhoto: (id, values) => set((state) => ({ photos: state.photos.map((photo) => photo.id === id ? { ...photo, ...values } : photo) })),
      setPublication: (id, publicationStatus) => set((state) => ({ photos: state.photos.map((photo) => photo.id === id ? { ...photo, publicationStatus } : photo) })),
      resetDemo: () => set({ ...initial, participants: [{ ...demoParticipant }], photos: [] })
    }),
    {
      name: "runframe-demo",
      partialize: (state) => ({
        participants: state.participants,
        photos: state.photos,
        currentParticipantId: state.currentParticipantId,
        selectedFrameId: state.selectedFrameId
      })
    }
  )
);
