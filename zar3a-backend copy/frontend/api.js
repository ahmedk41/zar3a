// frontend/api.js
// ─────────────────────────────────────────────────────────────
//  Zar3a – API Service  (copy to your React project)
//  Requires:  VITE_API_URL=http://localhost:3000  in .env
// ─────────────────────────────────────────────────────────────

const BASE = import.meta.env?.VITE_API_URL || "http://localhost:3000";

// ── Token store ──────────────────────────────────────────────

const Token = {
  getAccess:   () => localStorage.getItem("zar3a_access"),
  getRefresh:  () => localStorage.getItem("zar3a_refresh"),
  save: ({ accessToken, refreshToken }) => {
    localStorage.setItem("zar3a_access",  accessToken);
    localStorage.setItem("zar3a_refresh", refreshToken);
  },
  clear: () => {
    localStorage.removeItem("zar3a_access");
    localStorage.removeItem("zar3a_refresh");
  },
};

// ── Core fetch wrapper (auto-refresh on 401) ─────────────────

async function request(path, opts = {}, retry = false) {
  const headers = { ...opts.headers };
  const at = Token.getAccess();
  if (at) headers["Authorization"] = `Bearer ${at}`;
  if (!(opts.body instanceof FormData)) headers["Content-Type"] = "application/json";

  const res  = await fetch(`${BASE}${path}`, { ...opts, headers });

  if (res.status === 401 && !retry) {
    if (await tryRefresh()) return request(path, opts, true);
    Token.clear();
    window.location.href = "/login";
    return;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

async function tryRefresh() {
  const rt = Token.getRefresh();
  if (!rt) return false;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return false;
    Token.save(await res.json());
    return true;
  } catch { return false; }
}

// ── Auth API ─────────────────────────────────────────────────

export const authAPI = {

  // { fullName, email, password, confirmPassword }
  registerPartner: async (payload) => {
    const data = await request("/auth/register/partner", {
      method: "POST",
      body:   JSON.stringify(payload),
    });
    Token.save(data);
    return data;
  },

  // { fullName, email, password, confirmPassword,
  //   academicDegree, experienceYears, cvFile? }
  registerExpert: async (payload) => {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (k === "cvFile" && v) form.append("cv_file", v);
      else if (k !== "cvFile")  form.append(k, v);
    });
    const data = await request("/auth/register/expert", { method: "POST", body: form });
    Token.save(data);
    return data;
  },

  login: async (email, password) => {
    const data = await request("/auth/login", {
      method: "POST",
      body:   JSON.stringify({ email, password }),
    });
    Token.save(data);
    return data;
  },

  googleLogin: async (idToken) => {
    const data = await request("/auth/google", {
      method: "POST",
      body:   JSON.stringify({ idToken }),
    });
    Token.save(data);
    return data;
  },

  me: () => request("/auth/me"),

  logout: async () => {
    await request("/auth/logout", {
      method: "POST",
      body:   JSON.stringify({ refreshToken: Token.getRefresh() }),
    }).catch(() => {});
    Token.clear();
  },

  isLoggedIn: () => !!Token.getAccess(),
};
