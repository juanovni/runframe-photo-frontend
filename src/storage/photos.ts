import { del, get, set } from "idb-keyval";

const key = (photoId: string) => `runframe-photo:${photoId}`;

export const savePhotoImage = (photoId: string, dataUrl: string) => set(key(photoId), dataUrl);
export const getPhotoImage = (photoId: string) => get<string>(key(photoId));
export const deletePhotoImage = (photoId: string) => del(key(photoId));
