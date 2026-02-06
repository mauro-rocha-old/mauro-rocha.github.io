// DataContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Project, SiteContent, Language, Service } from "../types";
import { db } from "../config/firebase";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";

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
  login: (email: string, password: string) => Result;
  logout: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// -------------------- DEFAULTS + NORMALIZAÇÃO --------------------
type LangObj = { "pt-BR": string; en: string };

const defaultLang = (): LangObj => ({ "pt-BR": "", en: "" });

const defaultContent: SiteContent = {
  hero: {
    role: defaultLang(),
    title: defaultLang(),
    subtitle: defaultLang(),
    cta: defaultLang(),
  },
  about: {
    title: defaultLang(),
    p1: defaultLang(),
    p2: defaultLang(),
    skillsTitle: defaultLang(),
    profileImage: "",
  },
  contact: {
    title: defaultLang(),
    email: "",
    footerText: defaultLang(),
  },
};

function mergeLang(base: LangObj, incoming: any): LangObj {
  return {
    "pt-BR": typeof incoming?.["pt-BR"] === "string" ? incoming["pt-BR"] : base["pt-BR"],
    en: typeof incoming?.en === "string" ? incoming.en : base.en,
  };
}

/**
 * Garante que SEMPRE teremos hero/about/contact e suas chaves internas.
 * Isso evita "Cannot read properties of undefined (reading 'title')" em qualquer página.
 */
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
      profileImage: typeof c.about?.profileImage === "string" ? c.about.profileImage : "",
    },
    contact: {
      title: mergeLang(defaultContent.contact.title, c.contact?.title),
      email: typeof c.contact?.email === "string" ? c.contact.email : "",
      footerText: mergeLang(defaultContent.contact.footerText, c.contact?.footerText),
    },
  };
}

// -------------------- UTIL --------------------
function assertDb() {
  if (!db) throw new Error("Firestore não está configurado (db undefined).");
}

function mapDocWithNumericId<T extends { id: number }>(d: any): T {
  const data = d.data();
  const idFromField = typeof data?.id === "number" ? data.id : undefined;
  const idFromDocId = Number(d.id);
  const id = idFromField ?? (Number.isFinite(idFromDocId) ? idFromDocId : 0);
  return { ...data, id } as T;
}

/**
 * IDs sequenciais sem colisão usando transaction no meta/counters.
 * Lembrete: suas Rules PRECISAM permitir read+write em /meta/counters para admin.
 */
async function nextId(key: "projects" | "services"): Promise<number> {
  assertDb();
  const countersRef = doc(db, "meta", "counters");

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(countersRef);
    const current = snap.exists() ? (snap.data()?.[key] as number | undefined) : undefined;
    const next = (typeof current === "number" ? current : 0) + 1;

    tx.set(countersRef, { [key]: next, updatedAt: serverTimestamp() }, { merge: true });
    return next;
  });
}

// -------------------- PROVIDER --------------------
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [content, setContent] = useState<SiteContent>(defaultContent);

  const [language, setLanguage] = useState<Language>("pt-BR");

  // Auth real
  const auth = useMemo(() => getAuth(), []);
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = !!user;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, [auth]);

  const login = async (email: string, password: string): Result => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (e) {
      console.error("Auth login error:", e);
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  // -------------------- LISTENERS --------------------
  useEffect(() => {
    if (!db) {
      console.warn("Firestore não configurado: listeners não iniciados.");
      return;
    }

    const qProjects = query(collection(db, "projects"), orderBy("id", "asc"));
    const unsubProjects = onSnapshot(
      qProjects,
      (snapshot) => setProjects(snapshot.docs.map((d) => mapDocWithNumericId<Project>(d))),
      (error) => {
        console.error("Firestore Error (projects):", error);
        setProjects([]);
      },
    );

    const qServices = query(collection(db, "services"), orderBy("id", "asc"));
    const unsubServices = onSnapshot(
      qServices,
      (snapshot) => setServices(snapshot.docs.map((d) => mapDocWithNumericId<Service>(d))),
      (error) => {
        console.error("Firestore Error (services):", error);
        setServices([]);
      },
    );

    const unsubContent = onSnapshot(
      doc(db, "site_content", "main"),
      (snap) => {
        if (snap.exists()) setContent(normalizeContent(snap.data()));
        else setContent(defaultContent);
      },
      (error) => {
        console.error("Firestore Error (content):", error);
        // mantém defaultContent para não quebrar a home
        setContent(defaultContent);
      },
    );

    return () => {
      unsubProjects();
      unsubServices();
      unsubContent();
    };
  }, []);

  // -------------------- CRUD: Projects --------------------
  const updateProject = async (updatedProject: Project): Result => {
    try {
      assertDb();
      if (!auth.currentUser) return false;

      await setDoc(doc(db, "projects", String(updatedProject.id)), updatedProject, { merge: true });
      return true;
    } catch (e) {
      console.error("Error updating project:", e);
      return false;
    }
  };

  const addProject = async (projectData: Omit<Project, "id">): Result => {
    try {
      assertDb();
      if (!auth.currentUser) return false;

      const id = await nextId("projects");
      const newProject: Project = { ...projectData, id };

      await setDoc(doc(db, "projects", String(id)), newProject);
      return true;
    } catch (e) {
      console.error("Error adding project:", e);
      return false;
    }
  };

  const deleteProject = async (id: number): Result => {
    try {
      assertDb();
      if (!auth.currentUser) return false;

      await deleteDoc(doc(db, "projects", String(id)));
      return true;
    } catch (e) {
      console.error("Error deleting project:", e);
      return false;
    }
  };

  // -------------------- CRUD: Services --------------------
  const updateService = async (updatedService: Service): Result => {
    try {
      assertDb();
      if (!auth.currentUser) return false;

      await setDoc(doc(db, "services", String(updatedService.id)), updatedService, { merge: true });
      return true;
    } catch (e) {
      console.error("Error updating service:", e);
      return false;
    }
  };

  const addService = async (serviceData: Omit<Service, "id">): Result => {
    try {
      assertDb();
      if (!auth.currentUser) return false;

      const id = await nextId("services");
      const newService: Service = { ...serviceData, id };

      await setDoc(doc(db, "services", String(id)), newService);
      return true;
    } catch (e) {
      console.error("Error adding service:", e);
      return false;
    }
  };

  const deleteService = async (id: number): Result => {
    try {
      assertDb();
      if (!auth.currentUser) return false;

      await deleteDoc(doc(db, "services", String(id)));
      return true;
    } catch (e) {
      console.error("Error deleting service:", e);
      return false;
    }
  };

  // -------------------- Content --------------------
  const updateContent = async (section: keyof SiteContent, data: any): Result => {
    try {
      assertDb();
      if (!auth.currentUser) return false;

      // ✅ impede salvar conteúdo "manco": normaliza antes de persistir
      const merged = normalizeContent({
        ...content,
        [section]: data,
      });

      setContent(merged);
      await setDoc(doc(db, "site_content", "main"), merged, { merge: true });
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
