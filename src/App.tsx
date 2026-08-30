import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { QRCodeSVG } from "qrcode.react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import {
  Activity, ArrowLeft, ArrowRight, BadgeCheck, Camera, Check, ChevronRight, CircleGauge,
  Download, Frame, Image, LayoutDashboard, MessageCircle, Play, Plus, Printer, QrCode,
  RefreshCw, RotateCcw, ScanLine, ShieldCheck, Sparkles, Trash2, Upload, Users, Watch, X
} from "lucide-react";
import { activateWristband, registerParticipant, simulateExternalAction } from "./api/demo.api";
import { captureVideoFrame, composePhoto, createDemoPhoto, getEffectiveCameraWindow } from "./lib/photo-frame";
import { demoParticipant, frames, seededStats } from "./mocks";
import { deletePhotoImage, getPhotoImage, savePhotoImage } from "./storage/photos";
import { useDemoStore } from "./store/demo.store";
import type { Participant, Photo } from "./types";

const registrationSchema = z.object({
  name: z.string().min(3, "Ingresa el nombre completo"),
  bib: z.string().min(1, "Ingresa el dorsal"),
  distance: z.string().min(1),
  whatsapp: z.string().min(8, "Ingresa un numero valido"),
  photoConsent: z.literal(true, { error: "Se requiere autorizacion para tomar fotografias" }),
  socialConsent: z.boolean()
});

type RegistrationValues = z.infer<typeof registrationSchema>;

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <img
      src="/assets/logos/sopla-white.jpg"
      alt="SOPLA Running Club"
      className={`brand-image`}
    />
  );
}

function PrototypeBadge() {
  return <div className="prototype-badge"><span /> Prototipo funcional · Integraciones externas simuladas</div>;
}

function PreviewSponsors({ light = false }: { light?: boolean }) {
  return (
    <span className={`frame-preview-sponsors ${light ? "light" : ""}`}>
      <span>ccbites</span>
      <span>La Favorita</span>
      <span>Claro</span>
    </span>
  );
}

function FramePreviewContent({ frame }: { frame: (typeof frames)[number] }) {
  if (frame.id === "finisher") {
    return (
      <span className="frame-preview-caption finish-layout">
        <em>{frame.eyebrow}</em>
        <strong>{frame.title}</strong>
        <small>{frame.subtitle}</small>
        <span className="frame-preview-sponsors-label">Aliados que impulsan</span>
        <PreviewSponsors />
      </span>
    );
  }

  if (frame.id === "team") {
    return (
      <span className="frame-preview-caption team-layout">
        <span className="team-card-panel">
          <em>{frame.title}</em>
          <small>{frame.subtitle}</small>
          <PreviewSponsors light />
        </span>
      </span>
    );
  }

  if (frame.id === "guayaquil") {
    return (
      <span className="frame-preview-caption city-layout">
        <em>{frame.eyebrow}</em>
        <span className="city-stamp">GUAYAQUIL</span>
        <PreviewSponsors />
        <small>{frame.subtitle}</small>
      </span>
    );
  }

  return (
    <span className="frame-preview-caption power-layout">
      <PreviewSponsors />
      <div>
        <strong>{frame.title}</strong>
        <span className="frame-preview-sponsors-label">Aliados que impulsan</span>
      </div>
    </span>
  );
}

function frameTagline(frameId: string) {
  switch (frameId) {
    case "finisher":
      return "Tu carrera. Tu momento.";
    case "team":
      return "Cada paso cuenta.";
    case "guayaquil":
      return "La meta es tuya.";
    default:
      return "Juntos llegamos mas lejos.";
  }
}

function Shell({ children, back, tone = "light", topbarClassName }: { children: React.ReactNode; back?: string; tone?: "light" | "dark"; topbarClassName?: string }) {
  return (
    <div className={`app-shell ${tone}`}>
      <header className={`topbar ${topbarClassName ?? ""}`.trim()}>
        <div className="topbar-side">{back && <Link className="icon-button" to={back} aria-label="Volver"><ArrowLeft /></Link>}</div>
        <Link to="/" aria-label="Inicio"><Logo dark={tone === "dark"} /></Link>
        <div className="topbar-side end"><span className="rounded-full bg-[#0E2747] px-3 py-1 text-xs md:text-lg font-bold text-white">RUN 10K · 2026</span></div>
      </header>
      <main>{children}</main>
      {/* <PrototypeBadge /> */}
    </div>
  );
}

function Home() {
  return (
    <div className="home-page">
      <div className="home-grid" />
      <header className="home-header"><Logo dark /><span className="event-pill pale">GUAYAQUIL · 2026</span></header>
      <section className="hero-copy">
        <span className="overline">EXPERIENCIA RUNFRAME</span>
        <h1>Tu carrera.<br /><em>Tu momento.</em></h1>
        <p>Registra, activa y crea recuerdos de meta listos para compartir.</p>
      </section>
      <section className="mode-cards">
        <Link to="/admin" className="mode-card admin-card">
          <span className="mode-icon"><LayoutDashboard /></span>
          <span className="mode-number">01</span>
          <div><small>CONTROL DEL EVENTO</small><h2>Modo<br />administrador</h2><p>Registro, pulseras y metricas en tiempo real.</p></div>
          <span className="round-arrow"><ArrowRight /></span>
        </Link>
        <Link to="/kiosk" className="mode-card kiosk-card">
          <span className="mode-icon"><Camera /></span>
          <span className="mode-number">02</span>
          <div><small>EXPERIENCIA DEL CORREDOR</small><h2>Estacion<br />fotografica</h2><p>Escanea tu pulsera y captura tu foto Finisher.</p></div>
          <span className="round-arrow"><ArrowRight /></span>
        </Link>
      </section>
      <div className="home-footer"><PrototypeBadge /><span>CCBITES&nbsp;&nbsp; · &nbsp;&nbsp;LA FAVORITA&nbsp;&nbsp; · &nbsp;&nbsp;CLARO</span></div>
    </div>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell back="/">
      <div className="admin-layout">
        <aside className="side-nav">
          <div><span className="side-label">OPERACION</span>
            <Link to="/admin"><CircleGauge /> Resumen</Link>
            <Link to="/admin/register"><Plus /> Registrar corredor</Link>
            <Link to="/admin/activate"><ScanLine /> Activar pulsera</Link>
          </div>
          <div className="demo-control"><Sparkles /><strong>Demo preparada</strong><span>Ana Martinez · #1258</span><Link to="/kiosk">Abrir estacion <ChevronRight /></Link></div>
        </aside>
        <div className="admin-content">{children}</div>
      </div>
    </Shell>
  );
}

function Dashboard() {
  const participants = useDemoStore((state) => state.participants);
  const photos = useDemoStore((state) => state.photos);
  const resetDemo = useDemoStore((state) => state.resetDemo);
  const cards = [
    ["Participantes", seededStats.participants + participants.length - 1, Users, "+8 hoy"],
    ["Pulseras activas", seededStats.activeWristbands + participants.filter((item) => item.wristbandStatus === "active" && item.id !== demoParticipant.id).length, Watch, "90% activadas"],
    ["Fotos aprobadas", seededStats.approvedPhotos + photos.length, Image, `${seededStats.photosTaken + photos.length} capturas`],
    ["Entregas WhatsApp", seededStats.deliveries + photos.filter((item) => item.delivered).length, MessageCircle, "57% entregadas"]
  ] as const;
  const handleReset = async () => {
    await Promise.all(photos.map((photo) => deletePhotoImage(photo.id)));
    resetDemo();
  };
  return (
    <>
      <div className="section-heading"><div><span className="overline dark-text">CENTRO DE CONTROL</span><h1>El evento, en vivo.</h1><p>Martes, 25 de agosto · Parque Samanes</p></div><button className="button secondary" onClick={handleReset}><RotateCcw /> Reiniciar demo</button></div>
      <div className="stat-grid">{cards.map(([label, value, Icon, detail], index) => <article className={`stat-card stat-${index}`} key={label}><span className="stat-icon"><Icon /></span><small>{label}</small><strong>{value}</strong><span>{detail}</span></article>)}</div>
      <div className="dashboard-grid">
        <section className="panel activity-panel"><div className="panel-title"><div><span className="live-dot" /> ACTIVIDAD EN VIVO</div><span>Ultimos minutos</span></div>
          <div className="activity-list">
            <ActivityItem color="cyan" icon={<Camera />} title="Foto Finisher aprobada" meta="Ana Martinez · Dorsal 1258" time="Ahora" />
            <ActivityItem color="green" icon={<Watch />} title="Pulsera activada" meta="Marco Torres · Dorsal 0842" time="Hace 2 min" />
            <ActivityItem color="orange" icon={<MessageCircle />} title="Galeria entregada" meta="Carla Zambrano · 3 fotografias" time="Hace 5 min" />
          </div>
        </section>
        <section className="panel sponsor-panel"><div className="panel-title"><div>EXPOSICION DE MARCA</div><span>Fotos aprobadas</span></div><div className="sponsor-bars"><SponsorBar name="ccbites" value={92} color="#0963ae" /><SponsorBar name="La Favorita" value={78} color="#dc2529" /><SponsorBar name="Claro" value={64} color="#ed302b" /></div><div className="authorization"><ShieldCheck /><span><strong>{seededStats.authorized + photos.filter((photo) => photo.publicationStatus !== "private").length}</strong> autorizadas para Meta</span></div></section>
      </div>
    </>
  );
}

function ActivityItem({ color, icon, title, meta, time }: { color: string; icon: React.ReactNode; title: string; meta: string; time: string }) {
  return <div className="activity-item"><span className={`activity-icon ${color}`}>{icon}</span><div><strong>{title}</strong><span>{meta}</span></div><time>{time}</time></div>;
}

function SponsorBar({ name, value, color }: { name: string; value: number; color: string }) {
  return <div className="sponsor-row"><div><strong style={{ color }}>{name}</strong><span>{value}%</span></div><span className="bar"><i style={{ width: `${value}%`, background: color }} /></span></div>;
}

function RegisterParticipant() {
  const navigate = useNavigate();
  const addParticipant = useDemoStore((state) => state.addParticipant);
  const { register, handleSubmit, formState: { errors } } = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { name: "", bib: "", distance: "10K", whatsapp: "+593 ", photoConsent: true, socialConsent: false }
  });
  const mutation = useMutation({
    mutationFn: registerParticipant,
    onSuccess: (participant) => { addParticipant(participant); navigate(`/admin/wristband/${participant.id}`); }
  });
  return (
    <div className="form-page">
      <div className="section-heading compact"><div><span className="step-label">PASO 01 · REGISTRO</span><h1>Nuevo corredor</h1><p>Los datos se guardan localmente en este dispositivo.</p></div></div>
      <form className="registration-form" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <div className="field wide"><label>Nombre completo</label><input autoFocus placeholder="Ej. Ana Martinez" {...register("name")} />{errors.name && <small>{errors.name.message}</small>}</div>
        <div className="field"><label>Numero de dorsal</label><input inputMode="numeric" placeholder="1258" {...register("bib")} />{errors.bib && <small>{errors.bib.message}</small>}</div>
        <div className="field"><label>Distancia</label><select {...register("distance")}><option>5K</option><option>10K</option><option>21K</option></select></div>
        <div className="field wide"><label>WhatsApp</label><input type="tel" {...register("whatsapp")} />{errors.whatsapp && <small>{errors.whatsapp.message}</small>}</div>
        <label className="consent-card wide"><input type="checkbox" {...register("photoConsent")} /><span className="custom-check"><Check /></span><span><strong>Autorizacion para fotografias</strong><small>Permito la captura y entrega de mis fotografias durante el evento.</small></span></label>
        {errors.photoConsent && <small className="form-error wide">{errors.photoConsent.message}</small>}
        <label className="consent-card wide"><input type="checkbox" {...register("socialConsent")} /><span className="custom-check"><Check /></span><span><strong>Redes oficiales de SOPLA</strong><small>Autorizo que las fotografias tomadas en esta experiencia puedan usarse en redes oficiales de SOPLA.</small></span></label>
        <div className="form-actions wide"><Link className="button ghost" to="/admin">Cancelar</Link><button className="button primary" disabled={mutation.isPending}>{mutation.isPending ? "Creando..." : "Crear participante"}<ArrowRight /></button></div>
      </form>
    </div>
  );
}

function WristbandCard() {
  const { id } = useParams();
  const participant = useDemoStore((state) => state.participants.find((item) => item.id === id));
  const updateParticipant = useDemoStore((state) => state.updateParticipant);
  const navigate = useNavigate();
  const mutation = useMutation({ mutationFn: activateWristband, onSuccess: updateParticipant });
  if (!participant) return <Navigate to="/admin" replace />;
  const qrValue = JSON.stringify({ participantId: participant.id, token: participant.token });
  return (
    <div className="wristband-page">
      <div className="success-heading"><span><Check /></span><div><small>REGISTRO COMPLETADO</small><h1>La pulsera esta lista.</h1></div></div>
      <div className="wristband-ticket">
        <div className="ticket-info"><Logo dark /><span className="distance-chip">{participant.distance}</span><h2>{participant.name}</h2><strong className="bib">#{participant.bib}</strong><div className={`status ${participant.wristbandStatus}`}><span /> {participant.wristbandStatus === "active" ? "Pulsera activa" : "Pendiente de activacion"}</div><dl><div><dt>Token</dt><dd>{participant.token}</dd></div><div><dt>Fotos disponibles</dt><dd>{participant.photosRemaining}</dd></div></dl></div>
        <div className="ticket-qr"><QRCodeSVG value={qrValue} size={220} level="H" fgColor="#082745" /><small>ESCANEA PARA ACTIVAR</small></div>
      </div>
      <div className="ticket-actions"><button className="button secondary" onClick={() => window.print()}><Printer /> Imprimir pulsera</button>{participant.wristbandStatus === "pending" ? <button className="button primary" onClick={() => mutation.mutate(participant)} disabled={mutation.isPending}><Watch /> {mutation.isPending ? "Activando..." : "Activar ahora"}</button> : <button className="button primary" onClick={() => { useDemoStore.getState().selectParticipant(participant.id); navigate("/kiosk/frames"); }}><Play /> Iniciar experiencia</button>}</div>
    </div>
  );
}

function Activation() {
  const participants = useDemoStore((state) => state.participants);
  const updateParticipant = useDemoStore((state) => state.updateParticipant);
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<Participant | null>(null);
  const mutation = useMutation({ mutationFn: activateWristband, onSuccess: (participant) => { updateParticipant(participant); setFound(participant); } });
  const search = () => {
    const normalized = query.trim().toLowerCase();
    setFound(participants.find((item) => item.token.toLowerCase() === normalized || item.bib.toLowerCase() === normalized) ?? null);
  };
  return <div className="activation-page"><div className="section-heading compact"><div><span className="step-label">PASO 02 · ACTIVACION</span><h1>Activa una pulsera</h1><p>Escanea el QR o ingresa el token de prueba.</p></div></div><div className="scanner-box"><span className="scan-corners"><QrCode /></span><strong>Escaner preparado</strong><p>En esta demo tambien puedes buscar por token o dorsal.</p><div className="token-search"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="SOPLA-A7K92" onKeyDown={(event) => event.key === "Enter" && search()} /><button className="button primary" onClick={search}><ScanLine /> Buscar</button></div><button className="text-button" onClick={() => { setQuery(demoParticipant.token); setFound(participants.find((item) => item.id === demoParticipant.id) ?? null); }}>Usar token de demostracion</button></div>{found && <div className="participant-result"><span className="avatar">{found.name.charAt(0)}</span><div><small>PARTICIPANTE ENCONTRADO</small><strong>{found.name}</strong><span>Dorsal {found.bib} · {found.distance}</span></div><div className={`status ${found.wristbandStatus}`}><span /> {found.wristbandStatus === "active" ? "Activa" : "Pendiente"}</div>{found.wristbandStatus === "pending" ? <button className="button primary" onClick={() => mutation.mutate(found)}>Confirmar activacion</button> : <BadgeCheck className="result-check" />}</div>}</div>;
}

function KioskStart() {
  const navigate = useNavigate();
  const participants = useDemoStore((state) => state.participants);
  const selectParticipant = useDemoStore((state) => state.selectParticipant);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  const enter = (value: string) => {
    let parsed = value;
    try { parsed = JSON.parse(value).token ?? value; } catch { /* The manual token is already usable. */ }
    const participant = participants.find((item) => item.token.toLowerCase() === parsed.trim().toLowerCase());
    if (!participant) return setMessage("No encontramos esta pulsera.");
    if (participant.wristbandStatus !== "active") return setMessage("Esta pulsera aun no ha sido activada.");
    selectParticipant(participant.id);
    navigate("/kiosk/frames");
  };

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setScanning(true);
      setTimeout(async () => {
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        const Detector = (window as unknown as { BarcodeDetector?: new (options: { formats: string[] }) => { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector;
        if (!Detector) return setMessage("El escaneo QR no esta disponible en este navegador. Usa el token manual.");
        const detector = new Detector({ formats: ["qr_code"] });
        const scan = async () => {
          if (!stream.active) return;
          const codes = await detector.detect(video).catch(() => []);
          if (codes[0]) { stream.getTracks().forEach((track) => track.stop()); enter(codes[0].rawValue); return; }
          requestAnimationFrame(scan);
        };
        scan();
      });
    } catch { setMessage("No fue posible abrir la camara. Usa la pulsera demo."); }
  };

  return (
    <Shell back="/" tone="dark"><div className="kiosk-start"><div className="scan-orbit"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><span className="wrist-icon"><Watch /></span></div><span className="overline">ESTACION FOTOGRAFICA</span><h1>Acerca tu pulsera<br /><em>al lector</em></h1><p>Escanea el codigo QR para comenzar tu experiencia.</p>{scanning && <div className="qr-camera"><video ref={videoRef} playsInline muted /><span><ScanLine /></span></div>}<div className="kiosk-actions"><button className="button bright" onClick={startScanner}><QrCode /> Escanear QR</button><div className="divider"><span>o ingresa el token</span></div><div className="manual-token"><input value={token} onChange={(event) => setToken(event.target.value)} placeholder="SOPLA-A7K92" /><button onClick={() => enter(token)}><ArrowRight /></button></div><button className="demo-link" onClick={() => { selectParticipant(demoParticipant.id); navigate("/kiosk/frames"); }}><Sparkles /> Usar participante demo</button>{message && <p className="kiosk-message">{message}</p>}</div></div></Shell>
  );
}

function FrameSelection() {
  const navigate = useNavigate();
  const selectedFrameId = useDemoStore((state) => state.selectedFrameId);
  const selectFrame = useDemoStore((state) => state.selectFrame);
  const participant = useCurrentParticipant();
  if (!participant) return <Navigate to="/kiosk" replace />;
  const selectedFrame = frames.find((frame) => frame.id === selectedFrameId) ?? frames[0];
  const approvedPhotos = 4 - participant.photosRemaining;

  return (
    <Shell back="/kiosk">
      <div className="kiosk-content kiosk-frames-refined">
        <section className="frames-hero">
          <div className="frames-copy">
            <span className="frames-kicker">Corredora activa · {participant.name}</span>
            <h1>Elige tu imagen <span className="frames-accent-word">de llegada</span></h1>
          </div>

          <aside className="frames-meta">
            <div className="frames-meta-card">
              <strong>{participant.photosRemaining}/{participant.photosRemaining + approvedPhotos}</strong>
              <span>Fotos disponibles</span>
            </div>
          </aside>
        </section>

        <div className="frame-grid refined-grid">
          {frames.map((frame) => {
            const isSelected = selectedFrameId === frame.id;

            return (
              <div key={frame.id} className="frame-card-shell" style={{ "--accent": frame.accent, "--dark": frame.dark } as React.CSSProperties}>
                <button
                  className={`frame-card refined-card ${isSelected ? "selected" : ""}`}
                  onClick={() => selectFrame(frame.id)}
                >
                  <span className={`frame-preview refined-preview ${frame.previewImage ? "has-preview-image" : ""}`}>
                    {frame.previewImage ? <img className="frame-preview-image" src={frame.previewImage} alt={`Vista previa de ${frame.name}`} /> : null}
                    <span className="frame-preview-overlay" />
                    <div className="frame-preview-topline">
                      {frame.previewImage ? null : <Logo dark />}
                      <span className="frame-preview-badge">{frame.title}</span>
                    </div>
                    <FramePreviewContent frame={frame} />
                    {isSelected ? <span className="selected-check preview-check"><Check /></span> : null}
                  </span>
                </button>

                <div className="frame-name refined-name">
                  <span>
                    <strong>{frame.name}</strong>
                    <small>{frameTagline(frame.id)}</small>
                  </span>
                  {!isSelected ? <button type="button" className="frame-pick" onClick={() => selectFrame(frame.id)}>Elegir</button> : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky-action refined-action-bar">
          <div className="refined-selection-copy">
            <span>Seleccion actual</span>
            <strong>{selectedFrame.name}</strong>
          </div>

          <button className="button primary large refined-cta" disabled={participant.photosRemaining === 0} onClick={() => navigate("/kiosk/camera")}>
            Continuar <ArrowRight />
          </button>
        </div>
      </div>
    </Shell>
  );
}

function CameraCapture() {
  const navigate = useNavigate();
  const participant = useCurrentParticipant();
  const selectedFrame = frames.find((frame) => frame.id === useDemoStore((state) => state.selectedFrameId)) ?? frames[0];
  const setDraftPhoto = useDemoStore((state) => state.setDraftPhoto);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [cameraState, setCameraState] = useState<"loading" | "ready" | "blocked">("loading");
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: "user", width: { ideal: 1440 }, height: { ideal: 1080 } }, audio: false })
      .then(async (stream) => { if (!mounted) return stream.getTracks().forEach((track) => track.stop()); streamRef.current = stream; if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); setCameraState("ready"); } })
      .catch(() => setCameraState("blocked"));
    return () => { mounted = false; streamRef.current?.getTracks().forEach((track) => track.stop()); };
  }, []);

  if (!participant) return <Navigate to="/kiosk" replace />;
  const effectiveCameraWindow = getEffectiveCameraWindow(selectedFrame);
  const cameraWindowStyle = selectedFrame.overlayImage && effectiveCameraWindow
    ? {
        left: `${effectiveCameraWindow.x * 100}%`,
        top: `${effectiveCameraWindow.y * 100}%`,
        width: `${effectiveCameraWindow.width * 100}%`,
        height: `${effectiveCameraWindow.height * 100}%`,
        borderRadius: `${effectiveCameraWindow.radius ?? 0}px`
      }
    : undefined;
  const finishCapture = async (raw: string) => {
    const framed = await composePhoto(raw, selectedFrame, participant);
    setDraftPhoto({ raw, framed });
    navigate("/kiosk/review");
  };
  const takePhoto = () => {
    if (!videoRef.current || cameraState !== "ready") return;
    setCountdown(3);
    let value = 3;
    const timer = window.setInterval(() => {
      value -= 1;
      if (value === 0) {
        window.clearInterval(timer);
        setCountdown(null);
        finishCapture(captureVideoFrame(videoRef.current!));
      } else setCountdown(value);
    }, 900);
  };
  const upload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => finishCapture(String(reader.result));
    reader.readAsDataURL(file);
  };
  return <div className="camera-page"><div className="camera-view"><div className="camera-stage">{selectedFrame.overlayImage && effectiveCameraWindow ? <div className="camera-window" style={cameraWindowStyle}><video ref={videoRef} playsInline muted /></div> : <video ref={videoRef} playsInline muted />}<Link to="/kiosk/frames" className="camera-close icon-button light" aria-label="Volver"><X /></Link>{selectedFrame.overlayImage ? <img className="camera-overlay-image" src={selectedFrame.overlayImage} alt={`Guia visual de ${selectedFrame.name}`} /> : <div className="camera-output-frame"><div className="camera-output-header"><Logo dark /><span>{selectedFrame.eyebrow}</span></div><div className="camera-output-body" /><div className="camera-output-footer"><div><strong>{selectedFrame.title}</strong><small>{selectedFrame.subtitle}</small></div><span>Patrocinadores</span></div></div>}<div className={`camera-guide ${selectedFrame.overlayImage ? "overlay-guide" : ""}`}><span className="guide-top">MIRA AL FRENTE Y SONRIE</span><span className="face-guide" /><span className="guide-bottom">Ubicate dentro de la guia</span></div>{countdown && <div className="countdown">{countdown}</div>}{cameraState === "loading" && <div className="camera-state"><RefreshCw className="spin" /><strong>Preparando camara...</strong></div>}{cameraState === "blocked" && <div className="camera-state"><Camera /><strong>Camara no disponible</strong><span>Puedes cargar una foto o usar la imagen demo.</span></div>}</div></div><div className="camera-controls"><button className="control-option" onClick={() => fileRef.current?.click()}><Upload /> Cargar foto</button><button className="shutter" onClick={takePhoto} disabled={cameraState !== "ready" || countdown !== null}><span /></button><button className="control-option" onClick={() => finishCapture(createDemoPhoto())}><Sparkles /> Foto demo</button><input ref={fileRef} hidden type="file" accept="image/*" capture="user" onChange={(event) => upload(event.target.files?.[0])} /></div></div>;
}

function ReviewPhoto() {
  const navigate = useNavigate();
  const participant = useCurrentParticipant();
  const draft = useDemoStore((state) => state.draftPhoto);
  const selectedFrameId = useDemoStore((state) => state.selectedFrameId);
  const setDraftPhoto = useDemoStore((state) => state.setDraftPhoto);
  const approvePhoto = useDemoStore((state) => state.approvePhoto);
  const [saving, setSaving] = useState(false);
  if (!participant || !draft) return <Navigate to="/kiosk/camera" replace />;
  const approve = async () => {
    setSaving(true);
    const photo: Photo = { id: crypto.randomUUID(), participantId: participant.id, frameId: selectedFrameId, createdAt: new Date().toISOString(), publicationStatus: participant.socialConsent ? "authorized" : "private", delivered: false };
    await savePhotoImage(photo.id, draft.framed);
    approvePhoto(photo);
    navigate("/kiosk/gallery");
  };
  return (
    <Shell tone="dark">
      <div className="review-page review-centered-page">
        <div className="review-copy review-copy-centered">
          <span className="overline">REVISA TU FOTO</span>
          <h1>¿Es tu<br /><em>momento?</em></h1>
          <p>Solo al aprobar se descuenta una de tus cuatro fotografias.</p>
        </div>

        <div className="photo-result review-photo-centered">
          <img src={draft.framed} alt="Fotografia con marco SOPLA" />
        </div>

        <div className="sticky-action refined-action-bar review-action-bar">
          <button className="button ghost large review-secondary-cta" onClick={() => { setDraftPhoto(null); navigate("/kiosk/camera"); }}>
            <RefreshCw /> Repetir
          </button>
          <button className="button refined-cta large" onClick={approve} disabled={saving}>
            <Check /> {saving ? "Guardando..." : "Aprobar foto"}
          </button>
        </div>
      </div>
    </Shell>
  );
}

function Gallery() {
  const navigate = useNavigate();
  const participant = useCurrentParticipant();
  const allPhotos = useDemoStore((state) => state.photos);
  const photos = allPhotos.filter((photo) => photo.participantId === participant?.id);
  const updatePhoto = useDemoStore((state) => state.updatePhoto);
  const deletePhoto = useDemoStore((state) => state.deletePhoto);
  const [images, setImages] = useState<Record<string, string>>({});
  const [delivery, setDelivery] = useState<"idle" | "sending" | "sent">("idle");

  useEffect(() => { Promise.all(photos.map(async (photo) => [photo.id, await getPhotoImage(photo.id)] as const)).then((entries) => setImages(Object.fromEntries(entries.filter((entry) => entry[1])) as Record<string, string>)); }, [allPhotos.length]);
  if (!participant) return <Navigate to="/kiosk" replace />;
  const sendGallery = async () => { setDelivery("sending"); await simulateExternalAction(); photos.forEach((photo) => updatePhoto(photo.id, { delivered: true })); setDelivery("sent"); };
  const remove = async (id: string) => { await deletePhotoImage(id); deletePhoto(id); setImages((current) => { const next = { ...current }; delete next[id]; return next; }); };
  const download = (photo: Photo) => { const link = document.createElement("a"); link.href = images[photo.id]; link.download = `SOPLA-${participant.bib}-${photo.id.slice(0, 5)}.jpg`; link.click(); };
  return <Shell back="/kiosk/frames"><div className="gallery-page"><div className="gallery-heading"><div><span className="overline dark-text">GALERIA DE {participant.name.split(" ")[0].toUpperCase()}</span><h1>Momentos para recordar.</h1><p>{photos.length} aprobadas · {participant.photosRemaining} de 4 fotografias disponibles</p></div><button className="button primary" disabled={participant.photosRemaining === 0} onClick={() => navigate("/kiosk/frames")}><Camera /> Tomar otra foto</button></div>{photos.length === 0 ? <div className="empty-gallery"><Image /><h2>Tu galeria esta esperando</h2><p>Elige un marco y captura tu primer momento.</p><button className="button primary" onClick={() => navigate("/kiosk/frames")}>Comenzar <ArrowRight /></button></div> : <div className="gallery-grid">{photos.map((photo) => <article className="gallery-card" key={photo.id}>{images[photo.id] ? <img src={images[photo.id]} alt="Momento SOPLA aprobado" /> : <div className="image-loading"><RefreshCw className="spin" /></div>}<div className="gallery-card-info"><span><strong>{frames.find((frame) => frame.id === photo.frameId)?.name}</strong><small>{new Date(photo.createdAt).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}</small></span><div><button onClick={() => download(photo)} title="Descargar"><Download /></button><button onClick={() => remove(photo.id)} title="Eliminar"><Trash2 /></button></div></div><span className={`publication-tag ${photo.publicationStatus}`}>{photo.publicationStatus === "private" ? "Privada" : "Lista para redes"}</span></article>)}</div>}<div className="delivery-panel"><div><span className="whatsapp-icon"><MessageCircle /></span><span><strong>Recibe tu galeria en WhatsApp</strong><small>{participant.whatsapp}</small></span></div>{delivery === "sent" ? <span className="delivery-success"><BadgeCheck /> Galeria entregada correctamente</span> : <button className="button whatsapp" onClick={sendGallery} disabled={delivery === "sending"}>{delivery === "sending" ? "Enviando galeria..." : "Enviar ahora"}<ArrowRight /></button>}</div></div></Shell>;
}

function useCurrentParticipant() {
  return useDemoStore((state) => state.participants.find((participant) => participant.id === state.currentParticipantId));
}

export default function App() {
  return <Routes><Route path="/" element={<Home />} /><Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} /><Route path="/admin/register" element={<AdminLayout><RegisterParticipant /></AdminLayout>} /><Route path="/admin/activate" element={<AdminLayout><Activation /></AdminLayout>} /><Route path="/admin/wristband/:id" element={<AdminLayout><WristbandCard /></AdminLayout>} /><Route path="/kiosk" element={<KioskStart />} /><Route path="/kiosk/frames" element={<FrameSelection />} /><Route path="/kiosk/camera" element={<CameraCapture />} /><Route path="/kiosk/review" element={<ReviewPhoto />} /><Route path="/kiosk/gallery" element={<Gallery />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
}
