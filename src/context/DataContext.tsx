import type { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Language, Project, Service, SiteContent } from "../types";

type Result = Promise<boolean>;

interface DataContextType {
  projects: Project[];
  services: Service[];
  content: SiteContent;

  language: Language;
  setLanguage: (lang: Language) => void;

  updateProject: (project: Project) => Result;
  addProject: (project: Omit<Project, "id">) => Result;
  deleteProject: (id: number) => Result;

  updateService: (service: Service) => Result;
  addService: (service: Omit<Service, "id">) => Result;
  deleteService: (id: number) => Result;

  updateContent: (section: keyof SiteContent, data: any) => Result;

  isAuthenticated: boolean;
  user: User | null;
  initAuth: () => Promise<boolean>;
  login: (email: string, password: string) => Result;
  logout: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// -------------------- DEFAULTS + NORMALIZATION --------------------
type LangObj = { "pt-BR": string; en: string };

const defaultLang = (): LangObj => ({ "pt-BR": "", en: "" });

const defaultContent: SiteContent = {
  hero: {
    role: {
      "pt-BR": "Engenheiro de Software · IA & Dados · Produto",
      en: "Software Engineer · AI & Data · Product",
    },
    title: {
      "pt-BR": "Arquiteto de Sistemas",
      en: "Systems Architect",
    },
    subtitle: {
      "pt-BR":
        "Da arquitetura mobile ao backend orientado a dados. Construo sistemas que pensam, escalam e geram resultado real para o negocio.",
      en: "From mobile architecture to data-driven backend. I build systems that think, scale, and drive real business outcomes.",
    },
    cta: {
      "pt-BR": "Fale comigo",
      en: "Let's Talk",
    },
  },
  about: {
    title: {
      "pt-BR": "Sobre",
      en: "About",
    },
    p1: defaultLang(),
    p2: defaultLang(),
    skillsTitle: {
      "pt-BR": "Habilidades",
      en: "Skills",
    },
    skills: ["React", "TypeScript", "Next.js", "WebGL", "Node.js"],
    profileImage: "/images/profile.JPG",
  },
  contact: {
    title: {
      "pt-BR": "Contato",
      en: "Contact",
    },
    email: "contato@mauro-rocha.com.br",
    footerText: {
      "pt-BR": "Vamos construir algo de alto impacto.",
      en: "Let's build something with real impact.",
    },
  },
};

function mergeLang(base: LangObj, incoming: any): LangObj {
  return {
    "pt-BR": typeof incoming?.["pt-BR"] === "string" ? incoming["pt-BR"] : base["pt-BR"],
    en: typeof incoming?.en === "string" ? incoming.en : base.en,
  };
}

function normalizeStringArray(base: string[], incoming: any): string[] {
  if (!Array.isArray(incoming)) return base;
  return incoming.map((v) => (typeof v === "string" ? v.trim() : "")).filter((v) => v !== "");
}

function normalizeContent(raw: any): SiteContent {
  const c = raw ?? {};

  return {
    hero: {
      role: mergeLang(defaultContent.hero.role, c.hero?.role),
      title: mergeLang(defaultContent.hero.title, c.hero?.title),
      subtitle: mergeLang(defaultContent.hero.subtitle, c.hero?.subtitle),
      cta: mergeLang(defaultContent.hero.cta, c.hero?.cta),
    },
    about: {
      title: mergeLang(defaultContent.about.title, c.about?.title),
      p1: mergeLang(defaultContent.about.p1, c.about?.p1),
      p2: mergeLang(defaultContent.about.p2, c.about?.p2),
      skillsTitle: mergeLang(defaultContent.about.skillsTitle, c.about?.skillsTitle),
      skills: normalizeStringArray(defaultContent.about.skills, c.about?.skills),
      profileImage: typeof c.about?.profileImage === "string" ? c.about.profileImage : "",
    },
    contact: {
      title: mergeLang(defaultContent.contact.title, c.contact?.title),
      email: typeof c.contact?.email === "string" ? c.contact.email : "",
      footerText: mergeLang(defaultContent.contact.footerText, c.contact?.footerText),
    },
  };
}

interface CachedData {
  projects: Project[];
  services: Service[];
  content: SiteContent;
}

const CACHE_KEY = "mauro-rocha-portfolio-cache-v1";

function readCache(): CachedData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return {
      projects: Array.isArray(parsed?.projects) ? parsed.projects : [],
      services: Array.isArray(parsed?.services) ? parsed.services : [],
      content: normalizeContent(parsed?.content),
    };
  } catch {
    return null;
  }
}

function writeCache(data: CachedData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore quota and privacy mode errors.
  }
}

function mapDocWithNumericId<T extends { id: number }>(d: any): T {
  const data = d.data();
  const idFromField = typeof data?.id === "number" ? data.id : undefined;
  const idFromDocId = Number(d.id);
  const id = idFromField ?? (Number.isFinite(idFromDocId) ? idFromDocId : 0);
  return { ...data, id } as T;
}

type FirebaseDeps = {
  db: any;
  firestore: typeof import("firebase/firestore");
  auth: typeof import("firebase/auth");
};

let firebaseDepsPromise: Promise<FirebaseDeps | null> | null = null;

async function getFirebaseDeps(): Promise<FirebaseDeps | null> {
  if (!firebaseDepsPromise) {
    firebaseDepsPromise = (async () => {
      const [{ db }, firestore, auth] = await Promise.all([
        import("../config/firebase"),
        import("firebase/firestore"),
        import("firebase/auth"),
      ]);

      if (!db) return null;

      return {
        db,
        firestore,
        auth,
      };
    })().catch((error) => {
      console.error("Failed to load Firebase modules:", error);
      return null;
    });
  }

  return firebaseDepsPromise;
}

async function nextId(key: "projects" | "services"): Promise<number> {
  const deps = await getFirebaseDeps();
  if (!deps) throw new Error("Firestore is not configured.");

  const { db, firestore } = deps;
  const countersRef = firestore.doc(db, "meta", "counters");

  return firestore.runTransaction(db, async (tx) => {
    const snap = await tx.get(countersRef);
    const current = snap.exists() ? (snap.data()?.[key] as number | undefined) : undefined;
    const next = (typeof current === "number" ? current : 0) + 1;

    tx.set(countersRef, { [key]: next, updatedAt: firestore.serverTimestamp() }, { merge: true });
    return next;
  });
}

function useCachedInitialData() {
  return useMemo(() => readCache(), []);
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cached = useCachedInitialData();
  const [projects, setProjects] = useState<Project[]>(cached?.projects ?? []);
  const [services, setServices] = useState<Service[]>(cached?.services ?? []);
  const [content, setContent] = useState<SiteContent>(cached?.content ?? defaultContent);

  const [language, setLanguage] = useState<Language>("pt-BR");
  const authUnsubscribeRef = useRef<null | (() => void)>(null);
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = !!user;

  useEffect(() => {
    writeCache({ projects, services, content });
  }, [projects, services, content]);

  const initAuth = async () => {
    if (authUnsubscribeRef.current) return true;

    const deps = await getFirebaseDeps();
    if (!deps) return false;

    const authInstance = deps.auth.getAuth();
    authUnsubscribeRef.current = deps.auth.onAuthStateChanged(authInstance, (nextUser) => {
      setUser(nextUser);
    });
    setUser(authInstance.currentUser);
    return true;
  };

  useEffect(() => {
    return () => {
      authUnsubscribeRef.current?.();
      authUnsubscribeRef.current = null;
    };
  }, []);

  const login = async (email: string, password: string): Result => {
    try {
      const deps = await getFirebaseDeps();
      if (!deps) return false;

      const authInstance = deps.auth.getAuth();
      await deps.auth.signInWithEmailAndPassword(authInstance, email, password);
      setUser(authInstance.currentUser);
      void initAuth();
      return true;
    } catch (e) {
      console.error("Auth login error:", e);
      return false;
    }
  };

  const logout = async () => {
    const deps = await getFirebaseDeps();
    if (!deps) return;

    const authInstance = deps.auth.getAuth();
    await deps.auth.signOut(authInstance);
    setUser(authInstance.currentUser);
  };

  useEffect(() => {
    let canceled = false;
    let idleId: number | null = null;
    let timeoutId: number | null = null;
    let cleanup: null | (() => void) = null;

    const start = async () => {
      const deps = await getFirebaseDeps();
      if (!deps || canceled) {
        if (!deps) console.warn("Firestore is not configured: listeners were not started.");
        return;
      }

      const { db, firestore } = deps;

      const qProjects = firestore.query(
        firestore.collection(db, "projects"),
        firestore.orderBy("id", "asc"),
      );
      const unsubProjects = firestore.onSnapshot(
        qProjects,
        (snapshot) => {
          setProjects(snapshot.docs.map((d) => mapDocWithNumericId<Project>(d)));
        },
        (error) => {
          console.error("Firestore Error (projects):", error);
          setProjects([]);
        },
      );

      const qServices = firestore.query(
        firestore.collection(db, "services"),
        firestore.orderBy("id", "asc"),
      );
      const unsubServices = firestore.onSnapshot(
        qServices,
        (snapshot) => {
          setServices(snapshot.docs.map((d) => mapDocWithNumericId<Service>(d)));
        },
        (error) => {
          console.error("Firestore Error (services):", error);
          setServices([]);
        },
      );

      const unsubContent = firestore.onSnapshot(
        firestore.doc(db, "site_content", "main"),
        (snap) => {
          if (snap.exists()) setContent(normalizeContent(snap.data()));
          else setContent(defaultContent);
        },
        (error) => {
          console.error("Firestore Error (content):", error);
          setContent(defaultContent);
        },
      );

      cleanup = () => {
        unsubProjects();
        unsubServices();
        unsubContent();
      };
    };

    const isAdminPath =
      typeof window !== "undefined" && window.location.pathname.startsWith("/admin");

    if (isAdminPath) {
      void start();
    } else if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const requestIdle = (window as any).requestIdleCallback as (
        cb: () => void,
        opts?: { timeout?: number },
      ) => number;
      idleId = requestIdle(() => {
        void start();
      }, { timeout: 3000 });
    } else {
      timeoutId = window.setTimeout(() => {
        void start();
      }, 1200);
    }

    return () => {
      canceled = true;
      cleanup?.();
      if (idleId !== null && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        (window as any).cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, []);

  const updateProject = async (updatedProject: Project): Result => {
    try {
      const deps = await getFirebaseDeps();
      if (!deps) return false;

      const authInstance = deps.auth.getAuth();
      if (!authInstance.currentUser) return false;

      await deps.firestore.setDoc(
        deps.firestore.doc(deps.db, "projects", String(updatedProject.id)),
        updatedProject,
        { merge: true },
      );
      return true;
    } catch (e) {
      console.error("Error updating project:", e);
      return false;
    }
  };

  const addProject = async (projectData: Omit<Project, "id">): Result => {
    try {
      const deps = await getFirebaseDeps();
      if (!deps) return false;

      const authInstance = deps.auth.getAuth();
      if (!authInstance.currentUser) return false;

      const id = await nextId("projects");
      const newProject: Project = { ...projectData, id };

      await deps.firestore.setDoc(deps.firestore.doc(deps.db, "projects", String(id)), newProject);
      return true;
    } catch (e) {
      console.error("Error adding project:", e);
      return false;
    }
  };

  const deleteProject = async (id: number): Result => {
    try {
      const deps = await getFirebaseDeps();
      if (!deps) return false;

      const authInstance = deps.auth.getAuth();
      if (!authInstance.currentUser) return false;

      await deps.firestore.deleteDoc(deps.firestore.doc(deps.db, "projects", String(id)));
      return true;
    } catch (e) {
      console.error("Error deleting project:", e);
      return false;
    }
  };

  const updateService = async (updatedService: Service): Result => {
    try {
      const deps = await getFirebaseDeps();
      if (!deps) return false;

      const authInstance = deps.auth.getAuth();
      if (!authInstance.currentUser) return false;

      await deps.firestore.setDoc(
        deps.firestore.doc(deps.db, "services", String(updatedService.id)),
        updatedService,
        { merge: true },
      );
      return true;
    } catch (e) {
      console.error("Error updating service:", e);
      return false;
    }
  };

  const addService = async (serviceData: Omit<Service, "id">): Result => {
    try {
      const deps = await getFirebaseDeps();
      if (!deps) return false;

      const authInstance = deps.auth.getAuth();
      if (!authInstance.currentUser) return false;

      const id = await nextId("services");
      const newService: Service = { ...serviceData, id };

      await deps.firestore.setDoc(deps.firestore.doc(deps.db, "services", String(id)), newService);
      return true;
    } catch (e) {
      console.error("Error adding service:", e);
      return false;
    }
  };

  const deleteService = async (id: number): Result => {
    try {
      const deps = await getFirebaseDeps();
      if (!deps) return false;

      const authInstance = deps.auth.getAuth();
      if (!authInstance.currentUser) return false;

      await deps.firestore.deleteDoc(deps.firestore.doc(deps.db, "services", String(id)));
      return true;
    } catch (e) {
      console.error("Error deleting service:", e);
      return false;
    }
  };

  const updateContent = async (section: keyof SiteContent, data: any): Result => {
    try {
      const deps = await getFirebaseDeps();
      if (!deps) return false;

      const authInstance = deps.auth.getAuth();
      if (!authInstance.currentUser) return false;

      const merged = normalizeContent({
        ...content,
        [section]: data,
      });

      setContent(merged);
      await deps.firestore.setDoc(deps.firestore.doc(deps.db, "site_content", "main"), merged, {
        merge: true,
      });
      return true;
    } catch (e) {
      console.error("Error updating content:", e);
      return false;
    }
  };

  const value = useMemo<DataContextType>(
    () => ({
      projects,
      services,
      content,
      language,
      setLanguage,
      updateProject,
      addProject,
      deleteProject,
      updateService,
      addService,
      deleteService,
      updateContent,
      isAuthenticated,
      user,
      initAuth,
      login,
      logout,
    }),
    [projects, services, content, language, isAuthenticated, user],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
};
