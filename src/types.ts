export type WristbandStatus = "pending" | "active";
export type PublicationStatus = "private" | "authorized" | "review" | "scheduled" | "published";

export interface Participant {
  id: string;
  name: string;
  bib: string;
  distance: string;
  whatsapp: string;
  photoConsent: boolean;
  socialConsent: boolean;
  token: string;
  wristbandStatus: WristbandStatus;
  photosRemaining: number;
  createdAt: string;
}

export interface FrameTemplate {
  id: string;
  name: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  accent: string;
  dark: string;
  previewImage?: string;
  overlayImage?: string;
  cameraWindow?: {
    x: number;
    y: number;
    width: number;
    height: number;
    radius?: number;
  };
}

export interface Photo {
  id: string;
  participantId: string;
  frameId: string;
  createdAt: string;
  publicationStatus: PublicationStatus;
  delivered: boolean;
}

export interface RegistrationInput {
  name: string;
  bib: string;
  distance: string;
  whatsapp: string;
  photoConsent: boolean;
  socialConsent: boolean;
}
