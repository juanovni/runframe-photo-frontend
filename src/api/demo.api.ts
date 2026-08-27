import type { RegistrationInput, Participant, WristbandStatus } from "../types";

const wait = (ms = 550) => new Promise((resolve) => setTimeout(resolve, ms));

const token = () => `SOPLA-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

export async function registerParticipant(input: RegistrationInput): Promise<Participant> {
  await wait();
  return {
    ...input,
    id: crypto.randomUUID(),
    token: token(),
    wristbandStatus: "pending",
    photosRemaining: 4,
    createdAt: new Date().toISOString()
  };
}

export async function activateWristband(participant: Participant): Promise<Participant> {
  await wait(450);
  const wristbandStatus: WristbandStatus = "active";
  return { ...participant, wristbandStatus };
}

export async function simulateExternalAction(): Promise<{ ok: true; completedAt: string }> {
  await wait(900);
  return { ok: true, completedAt: new Date().toISOString() };
}
