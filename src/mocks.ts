import type { FrameTemplate, Participant } from "./types";

export const frames: FrameTemplate[] = [
  {
    id: "finisher",
    name: "Finisher 10K",
    eyebrow: "SOPLA RUN 10K",
    title: "FINISHER",
    subtitle: "GUAYAQUIL 2026",
    accent: "#62d9ef",
    dark: "#082b50",
    previewImage: "/assets/frames/finisher-selector.png",
    overlayImage: "/assets/frames/finisher-overlay.png",
    cameraWindow: {
      x: 0.512,
      y: 0.152,
      width: 0.47,
      height: 0.53,
      radius: 32
    }
  },
  {
    id: "team",
    name: "SOPLA Team",
    eyebrow: "RUN TOGETHER",
    title: "SOPLA TEAM",
    subtitle: "CADA PASO CUENTA",
    accent: "#87e4f2",
    dark: "#09213d",
    previewImage: "/assets/frames/team-selector.jpg",
    overlayImage: "/assets/frames/imparable-overlay.png",
    cameraWindow: {
      x: 0.512,
      y: 0.152,
      width: 0.47,
      height: 0.53,
      radius: 32
    }
  },
  {
    id: "guayaquil",
    name: "Guayaquil",
    eyebrow: "SOPLA RUN 10K",
    title: "GUAYAQUIL",
    subtitle: "LA META ES TUYA",
    accent: "#ffcf58",
    dark: "#093054",
    previewImage: "/assets/frames/guayaquil-selector.jpg",
    overlayImage: "/assets/frames/finisher-overlay.png",
    cameraWindow: {
      x: 0.512,
      y: 0.152,
      width: 0.47,
      height: 0.53,
      radius: 32
    }
  },
  {
    id: "sponsor",
    name: "Aliados que impulsan",
    eyebrow: "JUNTOS LLEGAMOS MAS LEJOS",
    title: "IMPARABLE",
    subtitle: "SOPLA RUN 2026",
    accent: "#ff6f61",
    dark: "#072540",
    previewImage: "/assets/frames/imparable-selector.jpg",
    overlayImage: "/assets/frames/imparable-overlay.png",
    cameraWindow: {
      x: 0.08,
      y: 0.12,
      width: 0.84,
      height: 0.68,
      radius: 28
    }
  }
];

export const demoParticipant: Participant = {
  id: "demo-001",
  name: "Ana Martinez",
  bib: "1258",
  distance: "10K",
  whatsapp: "+593 99 123 4567",
  photoConsent: true,
  socialConsent: false,
  token: "SOPLA-A7K92",
  wristbandStatus: "active",
  photosRemaining: 4,
  createdAt: new Date().toISOString()
};

export const seededStats = {
  participants: 30,
  activeWristbands: 27,
  photosTaken: 82,
  approvedPhotos: 54,
  deliveries: 31,
  authorized: 18
};
