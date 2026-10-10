import { describe, expect, it } from "vitest";

import {
  allowedStarRepo,
  DEFAULT_STAR_REPOS,
  hasStarScope,
  isSameOriginRequest,
  parseStarRepos,
  safeStarReturn,
  starCsrfToken,
  verifyStarCsrfToken,
} from "@ostiary/core/lib/github-star";

describe("parseStarRepos", () => {
  it("defaults to the Cyber Library repository", () => {
    expect(parseStarRepos(undefined)).toEqual([DEFAULT_STAR_REPOS]);
    expect(parseStarRepos("")).toEqual([DEFAULT_STAR_REPOS]);
    expect(parseStarRepos("  ,  ")).toEqual([DEFAULT_STAR_REPOS]);
  });

  it("reads comma or space separated owner/repo entries", () => {
    expect(parseStarRepos("Cyber-Courses/Cyber-Library, isoloom/isoloom Cyber-Courses/cyber-ctf")).toEqual([
      "Cyber-Courses/Cyber-Library",
      "isoloom/isoloom",
      "Cyber-Courses/cyber-ctf",
    ]);
  });

  it("drops malformed entries and duplicates", () => {
    expect(
      parseStarRepos("Cyber-Courses/Cyber-Library,cyber-courses/cyber-library,nope,a/b/c,../etc,-x/y,o/r..,https://github.com/a/b"),
    ).toEqual(["Cyber-Courses/Cyber-Library"]);
  });

  it("falls back to the default when nothing is valid", () => {
    expect(parseStarRepos("not a repo")).toEqual([DEFAULT_STAR_REPOS]);
  });
});

describe("allowedStarRepo", () => {
  const allowlist = ["Cyber-Courses/Cyber-Library", "isoloom/isoloom"];

  it("returns the allowlist entry, case-insensitively", () => {
    expect(allowedStarRepo("Cyber-Courses/Cyber-Library", allowlist)).toBe("Cyber-Courses/Cyber-Library");
    expect(allowedStarRepo("cyber-courses/cyber-library", allowlist)).toBe("Cyber-Courses/Cyber-Library");
    expect(allowedStarRepo(" isoloom/isoloom ", allowlist)).toBe("isoloom/isoloom");
  });

  it("refuses every other repository", () => {
    for (const raw of [
      "Cyber-Courses/Cyber-Library-Website",
      "Cyber-Courses",
      "evil/Cyber-Library",
      "Cyber-Courses/Cyber-Library/../evil",
      "",
      undefined,
      null,
    ]) {
      expect(allowedStarRepo(raw, allowlist)).toBeNull();
    }
  });

  it("ignores non-string input", () => {
    expect(allowedStarRepo(["Cyber-Courses/Cyber-Library"] as unknown as string, allowlist)).toBeNull();
  });
});

describe("safeStarReturn", () => {
  it("accepts https URLs on a family site, apex or www", () => {
    for (const [raw, name] of [
      ["https://www.cyberlibrary.com/en/docs/web", "Cyber Library"],
      ["https://cyberlibrary.com/", "Cyber Library"],
      ["https://www.cyberctf.org/labs?x=1#top", "Cyber CTF"],
      ["https://cybercourses.com/fr", "Cyber Courses"],
      ["https://www.cyberbench.app", "Cyber Bench"],
      ["https://www.cyberexperts.io/", "Cyber Experts"],
      ["https://WWW.CYBERLIBRARY.COM/en", "Cyber Library"],
    ] as const) {
      expect(safeStarReturn(raw)?.site.name, raw).toBe(name);
    }
    expect(safeStarReturn("https://www.cyberlibrary.com/en/docs")?.site.product).toBe("library");
    expect(safeStarReturn("https://www.cyberexperts.io/")?.site.product).toBeNull();
  });

  it("returns the URL as the browser would load it", () => {
    expect(safeStarReturn("https://www.cyberlibrary.com/en/docs/web?x=1#a")?.url).toBe(
      "https://www.cyberlibrary.com/en/docs/web?x=1#a",
    );
  });

  it("refuses other hosts, look-alikes and other subdomains", () => {
    for (const raw of [
      "https://evil.com/",
      "https://cyberlibrary.com.evil.com/",
      "https://evilcyberlibrary.com/",
      "https://www.cyberlibrary.co/",
      "https://docs.cyberlibrary.com/",
      "https://a.www.cyberlibrary.com/",
      "https://cyberauth.co/",
    ]) {
      expect(safeStarReturn(raw), raw).toBeNull();
    }
  });

  it("refuses relative, protocol-relative and non-https URLs", () => {
    for (const raw of [
      "/en/dashboard",
      "//www.cyberlibrary.com/",
      "http://www.cyberlibrary.com/",
      "javascript:alert(1)",
      "data:text/html,hi",
      "ftp://cyberlibrary.com/",
    ]) {
      expect(safeStarReturn(raw), raw).toBeNull();
    }
  });

  it("refuses credentials, ports, backslashes, whitespace and control characters", () => {
    for (const raw of [
      "https://user:pass@www.cyberlibrary.com/",
      "https://www.cyberlibrary.com@evil.com/",
      "https://www.cyberlibrary.com:8443/",
      "https:\\\\evil.com",
      "https://www.cyberlibrary.com\\@evil.com/",
      " https://www.cyberlibrary.com/",
      "https://www.cyberlibrary.com/\n",
      "https://www.cyber\tlibrary.com/",
    ]) {
      expect(safeStarReturn(raw), JSON.stringify(raw)).toBeNull();
    }
  });

  it("refuses missing or oversized values", () => {
    expect(safeStarReturn(undefined)).toBeNull();
    expect(safeStarReturn(null)).toBeNull();
    expect(safeStarReturn("")).toBeNull();
    expect(safeStarReturn(`https://www.cyberlibrary.com/${"a".repeat(2100)}`)).toBeNull();
  });

  it("accepts localhost only when allowed (development)", () => {
    expect(safeStarReturn("http://localhost:3307/en")).toBeNull();
    expect(safeStarReturn("http://localhost:3307/en", { allowLocalhost: true })?.url).toBe("http://localhost:3307/en");
    expect(safeStarReturn("http://evil.com/", { allowLocalhost: true })).toBeNull();
  });
});

describe("hasStarScope", () => {
  it("needs public_repo or repo", () => {
    expect(hasStarScope(["read:user", "user:email", "public_repo"])).toBe(true);
    expect(hasStarScope(["repo"])).toBe(true);
    expect(hasStarScope("read:user,public_repo")).toBe(true);
    expect(hasStarScope(["read:user,user:email,public_repo"])).toBe(true);
    expect(hasStarScope(["read:user", "user:email"])).toBe(false);
    expect(hasStarScope(["public_repo:read"])).toBe(false);
    expect(hasStarScope(null)).toBe(false);
    expect(hasStarScope([])).toBe(false);
  });
});

describe("star CSRF token", () => {
  const secret = "s".repeat(32);

  it("verifies for the same session and repository only", () => {
    const token = starCsrfToken(secret, "session-1", "Cyber-Courses/Cyber-Library");
    expect(verifyStarCsrfToken(secret, "session-1", "Cyber-Courses/Cyber-Library", token)).toBe(true);
    expect(verifyStarCsrfToken(secret, "session-1", "cyber-courses/cyber-library", token)).toBe(true);
    expect(verifyStarCsrfToken(secret, "session-2", "Cyber-Courses/Cyber-Library", token)).toBe(false);
    expect(verifyStarCsrfToken(secret, "session-1", "isoloom/isoloom", token)).toBe(false);
    expect(verifyStarCsrfToken("t".repeat(32), "session-1", "Cyber-Courses/Cyber-Library", token)).toBe(false);
  });

  it("refuses missing or malformed tokens", () => {
    for (const token of [undefined, null, "", 42, "x".repeat(200), {}]) {
      expect(verifyStarCsrfToken(secret, "session-1", "Cyber-Courses/Cyber-Library", token)).toBe(false);
    }
  });
});

describe("isSameOriginRequest", () => {
  const origin = "https://www.cyberauth.co";

  it("checks the Origin header", () => {
    expect(isSameOriginRequest(new Headers({ origin }), origin)).toBe(true);
    expect(isSameOriginRequest(new Headers({ origin: "https://www.cyberlibrary.com" }), origin)).toBe(false);
    expect(isSameOriginRequest(new Headers({ origin: "null" }), origin)).toBe(false);
  });

  it("falls back to fetch metadata without an Origin header", () => {
    expect(isSameOriginRequest(new Headers({ "sec-fetch-site": "same-origin" }), origin)).toBe(true);
    expect(isSameOriginRequest(new Headers({ "sec-fetch-site": "cross-site" }), origin)).toBe(false);
    expect(isSameOriginRequest(new Headers(), origin)).toBe(false);
  });
});
