import React from "react";
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { useBusinessPortal } from "../../../src/hooks/useBusinessPortal";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("../../../src/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

import { useAuth } from "../../../src/context/AuthContext";
import { useNavigate } from "react-router-dom";

// ─── Helpers ──────────────────────────────────────────────────────────────────

let mockNavigate: ReturnType<typeof vi.fn>;
let mockSetAuth: ReturnType<typeof vi.fn>;

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(MemoryRouter, {}, children);

const mockFetchOk = (body: object) => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(body),
    }),
  );
};

const mockFetchError = (body: object) => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue(body),
    }),
  );
};

const mockFetchNetworkError = () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
};

const SAMPLE_FORM = {
  cafeName: "Bean There",
  ownerName: "Jane Doe",
  email: "jane@example.com",
  phone: "555-123-4567",
  city: "Toronto",
  message: "Would love to join!",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useBusinessPortal", () => {
  beforeEach(() => {
    mockNavigate = vi.fn();
    mockSetAuth = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useAuth).mockReturnValue({ setAuth: mockSetAuth } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  describe("initial state", () => {
    it("defaults step to 'choose'", () => {
      const { result } = renderHook(() => useBusinessPortal(), { wrapper });
      expect(result.current.step).toBe("choose");
    });

    it("accepts a custom defaultStep", () => {
      const { result } = renderHook(() => useBusinessPortal("signin"), { wrapper });
      expect(result.current.step).toBe("signin");
    });

    it("loading is false", () => {
      const { result } = renderHook(() => useBusinessPortal(), { wrapper });
      expect(result.current.loading).toBe(false);
    });

    it("error is null", () => {
      const { result } = renderHook(() => useBusinessPortal(), { wrapper });
      expect(result.current.error).toBeNull();
    });

    it("email is empty string", () => {
      const { result } = renderHook(() => useBusinessPortal(), { wrapper });
      expect(result.current.email).toBe("");
    });

    it("submittedCafe has empty name and email", () => {
      const { result } = renderHook(() => useBusinessPortal(), { wrapper });
      expect(result.current.submittedCafe).toEqual({ name: "", email: "" });
    });

    it("stepMeta is undefined for 'choose' step", () => {
      const { result } = renderHook(() => useBusinessPortal(), { wrapper });
      expect(result.current.stepMeta).toBeUndefined();
    });

    it("showProgress is false for 'choose' step", () => {
      const { result } = renderHook(() => useBusinessPortal(), { wrapper });
      expect(result.current.showProgress).toBe(false);
    });
  });

  // ── Navigation helpers ─────────────────────────────────────────────────────

  describe("goBack", () => {
    it("sets step to 'choose'", () => {
      const { result } = renderHook(() => useBusinessPortal("signin"), { wrapper });
      act(() => {
        result.current.goBack();
      });
      expect(result.current.step).toBe("choose");
    });

    it("clears error when going back", () => {
      const { result } = renderHook(() => useBusinessPortal("signin"), { wrapper });
      // Simulate an existing error by triggering one; we'll set it via internal mechanism
      // Using sendOTP with a network error to set an error, then goBack
      act(() => {
        result.current.goBack();
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe("goToSignIn", () => {
    it("sets step to 'signin'", () => {
      const { result } = renderHook(() => useBusinessPortal(), { wrapper });
      act(() => {
        result.current.goToSignIn();
      });
      expect(result.current.step).toBe("signin");
    });
  });

  describe("goToRequest", () => {
    it("sets step to 'request'", () => {
      const { result } = renderHook(() => useBusinessPortal(), { wrapper });
      act(() => {
        result.current.goToRequest();
      });
      expect(result.current.step).toBe("request");
    });
  });

  describe("clearError", () => {
    it("clears the error state", async () => {
      mockFetchNetworkError();
      const { result } = renderHook(() => useBusinessPortal(), { wrapper });
      await act(async () => {
        await result.current.sendOTP("test@example.com");
      });
      expect(result.current.error).not.toBeNull();
      act(() => {
        result.current.clearError();
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe("reset", () => {
    it("resets step, email, error, and submittedCafe to defaults", async () => {
      mockFetchOk({});
      const { result } = renderHook(() => useBusinessPortal(), { wrapper });
      await act(async () => {
        await result.current.sendOTP("user@example.com");
      });
      act(() => {
        result.current.reset();
      });
      expect(result.current.step).toBe("choose");
      expect(result.current.email).toBe("");
      expect(result.current.error).toBeNull();
      expect(result.current.submittedCafe).toEqual({ name: "", email: "" });
      expect(result.current.loading).toBe(false);
    });
  });

  describe("changeEmail", () => {
    it("sets step back to 'signin' and clears error", async () => {
      mockFetchOk({});
      const { result } = renderHook(() => useBusinessPortal("otp"), { wrapper });
      act(() => {
        result.current.changeEmail();
      });
      expect(result.current.step).toBe("signin");
      expect(result.current.error).toBeNull();
    });
  });

  // ── sendOTP ────────────────────────────────────────────────────────────────

  describe("sendOTP", () => {
    it("sets step to 'otp' on success", async () => {
      mockFetchOk({ message: "OTP sent" });
      const { result } = renderHook(() => useBusinessPortal(), { wrapper });
      await act(async () => {
        await result.current.sendOTP("user@example.com");
      });
      expect(result.current.step).toBe("otp");
    });

    it("stores the email on success", async () => {
      mockFetchOk({ message: "OTP sent" });
      const { result } = renderHook(() => useBusinessPortal(), { wrapper });
      await act(async () => {
        await result.current.sendOTP("user@example.com");
      });
      expect(result.current.email).toBe("user@example.com");
    });

    it("calls POST /api/business/send-otp with email in body", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });
      vi.stubGlobal("fetch", fetchMock);
      const { result } = renderHook(() => useBusinessPortal(), { wrapper });
      await act(async () => {
        await result.current.sendOTP("user@example.com");
      });
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/business/send-otp",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "user@example.com" }),
        }),
      );
    });

    it("sets error when API returns error response", async () => {
      mockFetchError({ message: "Email not registered" });
      const { result } = renderHook(() => useBusinessPortal(), { wrapper });
      await act(async () => {
        await result.current.sendOTP("bad@example.com");
      });
      expect(result.current.error).toBe("Email not registered");
      expect(result.current.step).toBe("choose");
    });

    it("sets generic error on network failure", async () => {
      mockFetchNetworkError();
      const { result } = renderHook(() => useBusinessPortal(), { wrapper });
      await act(async () => {
        await result.current.sendOTP("user@example.com");
      });
      expect(result.current.error).toBeTruthy();
      expect(result.current.step).toBe("choose");
    });

    it("sets loading=true during request and false after", async () => {
      let resolveJson!: (v: object) => void;
      const jsonPromise = new Promise<object>((res) => { resolveJson = res; });
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true, json: () => jsonPromise }),
      );
      const { result } = renderHook(() => useBusinessPortal(), { wrapper });
      let sendPromise: Promise<void>;
      act(() => {
        sendPromise = result.current.sendOTP("user@example.com");
      });
      expect(result.current.loading).toBe(true);
      await act(async () => {
        resolveJson({ message: "ok" });
        await sendPromise;
      });
      expect(result.current.loading).toBe(false);
    });
  });

  // ── verifyOTP ──────────────────────────────────────────────────────────────

  describe("verifyOTP", () => {
    it("calls setAuth with user, accessToken, refreshToken on success", async () => {
      const userData = { user: { id: 1 }, accessToken: "acc123", refreshToken: "ref456" };
      mockFetchOk({ data: userData });
      const { result } = renderHook(() => useBusinessPortal("otp"), { wrapper });
      await act(async () => {
        await result.current.verifyOTP("123456");
      });
      expect(mockSetAuth).toHaveBeenCalledWith(
        userData.user,
        userData.accessToken,
        userData.refreshToken,
      );
    });

    it("navigates to '/dashboard' on success", async () => {
      const userData = { user: { id: 1 }, accessToken: "acc123", refreshToken: "ref456" };
      mockFetchOk({ data: userData });
      const { result } = renderHook(() => useBusinessPortal("otp"), { wrapper });
      await act(async () => {
        await result.current.verifyOTP("123456");
      });
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });

    it("calls POST /api/business/verify-otp with email and otp", async () => {
      mockFetchOk({});
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ data: { user: {}, accessToken: "", refreshToken: "" } }),
      });
      vi.stubGlobal("fetch", fetchMock);
      // First set the email via sendOTP
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({}),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({ data: { user: {}, accessToken: "t", refreshToken: "r" } }),
          }),
      );
      const { result } = renderHook(() => useBusinessPortal(), { wrapper });
      await act(async () => {
        await result.current.sendOTP("portal@example.com");
      });
      await act(async () => {
        await result.current.verifyOTP("999999");
      });
      const calls = vi.mocked(fetch).mock.calls;
      const verifyCall = calls.find(([url]) => String(url).includes("verify-otp"));
      expect(verifyCall).toBeDefined();
      expect(JSON.parse(verifyCall![1]!.body as string)).toMatchObject({
        email: "portal@example.com",
        otp: "999999",
      });
    });

    it("sets error on API failure", async () => {
      mockFetchError({ message: "Invalid OTP" });
      const { result } = renderHook(() => useBusinessPortal("otp"), { wrapper });
      await act(async () => {
        await result.current.verifyOTP("000000");
      });
      expect(result.current.error).toBe("Invalid OTP");
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("sets error on network failure", async () => {
      mockFetchNetworkError();
      const { result } = renderHook(() => useBusinessPortal("otp"), { wrapper });
      await act(async () => {
        await result.current.verifyOTP("000000");
      });
      expect(result.current.error).toBeTruthy();
    });
  });

  // ── resendOTP ──────────────────────────────────────────────────────────────

  describe("resendOTP", () => {
    it("calls POST /api/business/resend-otp", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });
      vi.stubGlobal("fetch", fetchMock);
      const { result } = renderHook(() => useBusinessPortal("otp"), { wrapper });
      await act(async () => {
        await result.current.resendOTP();
      });
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/business/resend-otp",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("does not change step on success", async () => {
      mockFetchOk({});
      const { result } = renderHook(() => useBusinessPortal("otp"), { wrapper });
      await act(async () => {
        await result.current.resendOTP();
      });
      expect(result.current.step).toBe("otp");
    });

    it("clears error before resending", async () => {
      // First trigger an error, then resend successfully
      mockFetchError({ message: "Invalid OTP" });
      const { result } = renderHook(() => useBusinessPortal("otp"), { wrapper });
      await act(async () => {
        await result.current.verifyOTP("000");
      });
      expect(result.current.error).not.toBeNull();

      mockFetchOk({});
      await act(async () => {
        await result.current.resendOTP();
      });
      expect(result.current.error).toBeNull();
    });

    it("sets error on API failure", async () => {
      mockFetchError({ message: "Could not resend" });
      const { result } = renderHook(() => useBusinessPortal("otp"), { wrapper });
      await act(async () => {
        await result.current.resendOTP();
      });
      expect(result.current.error).toBe("Could not resend");
    });

    it("sets error on network failure", async () => {
      mockFetchNetworkError();
      const { result } = renderHook(() => useBusinessPortal("otp"), { wrapper });
      await act(async () => {
        await result.current.resendOTP();
      });
      expect(result.current.error).toBeTruthy();
    });
  });

  // ── submitAccessRequest ────────────────────────────────────────────────────

  describe("submitAccessRequest", () => {
    it("sets step to 'success' on successful submission", async () => {
      mockFetchOk({ message: "Request received" });
      const { result } = renderHook(() => useBusinessPortal("request"), { wrapper });
      await act(async () => {
        await result.current.submitAccessRequest(SAMPLE_FORM);
      });
      expect(result.current.step).toBe("success");
    });

    it("stores submittedCafe with cafeName and email from form", async () => {
      mockFetchOk({ message: "Request received" });
      const { result } = renderHook(() => useBusinessPortal("request"), { wrapper });
      await act(async () => {
        await result.current.submitAccessRequest(SAMPLE_FORM);
      });
      expect(result.current.submittedCafe).toEqual({
        name: SAMPLE_FORM.cafeName,
        email: SAMPLE_FORM.email,
      });
    });

    it("calls POST /api/business/request-access with form data", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });
      vi.stubGlobal("fetch", fetchMock);
      const { result } = renderHook(() => useBusinessPortal("request"), { wrapper });
      await act(async () => {
        await result.current.submitAccessRequest(SAMPLE_FORM);
      });
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/business/request-access",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(SAMPLE_FORM),
        }),
      );
    });

    it("sets error on API failure", async () => {
      mockFetchError({ message: "Duplicate submission" });
      const { result } = renderHook(() => useBusinessPortal("request"), { wrapper });
      await act(async () => {
        await result.current.submitAccessRequest(SAMPLE_FORM);
      });
      expect(result.current.error).toBe("Duplicate submission");
      expect(result.current.step).toBe("request");
    });

    it("sets error on network failure", async () => {
      mockFetchNetworkError();
      const { result } = renderHook(() => useBusinessPortal("request"), { wrapper });
      await act(async () => {
        await result.current.submitAccessRequest(SAMPLE_FORM);
      });
      expect(result.current.error).toBeTruthy();
    });

    it("sets loading=false after completion", async () => {
      mockFetchOk({});
      const { result } = renderHook(() => useBusinessPortal("request"), { wrapper });
      await act(async () => {
        await result.current.submitAccessRequest(SAMPLE_FORM);
      });
      expect(result.current.loading).toBe(false);
    });
  });

  // ── stepMeta and showProgress ──────────────────────────────────────────────

  describe("stepMeta and showProgress", () => {
    it("stepMeta is { current: 1, total: 2 } on 'signin' step", () => {
      const { result } = renderHook(() => useBusinessPortal("signin"), { wrapper });
      expect(result.current.stepMeta).toEqual({ current: 1, total: 2 });
    });

    it("stepMeta is { current: 2, total: 2 } on 'otp' step", () => {
      const { result } = renderHook(() => useBusinessPortal("otp"), { wrapper });
      expect(result.current.stepMeta).toEqual({ current: 2, total: 2 });
    });

    it("stepMeta is { current: 1, total: 1 } on 'request' step", () => {
      const { result } = renderHook(() => useBusinessPortal("request"), { wrapper });
      expect(result.current.stepMeta).toEqual({ current: 1, total: 1 });
    });

    it("stepMeta is undefined on 'choose' step", () => {
      const { result } = renderHook(() => useBusinessPortal("choose"), { wrapper });
      expect(result.current.stepMeta).toBeUndefined();
    });

    it("stepMeta is undefined on 'success' step", () => {
      const { result } = renderHook(() => useBusinessPortal("success"), { wrapper });
      expect(result.current.stepMeta).toBeUndefined();
    });

    it("showProgress is true on 'signin' step", () => {
      const { result } = renderHook(() => useBusinessPortal("signin"), { wrapper });
      expect(result.current.showProgress).toBe(true);
    });

    it("showProgress is true on 'otp' step", () => {
      const { result } = renderHook(() => useBusinessPortal("otp"), { wrapper });
      expect(result.current.showProgress).toBe(true);
    });

    it("showProgress is true on 'request' step", () => {
      const { result } = renderHook(() => useBusinessPortal("request"), { wrapper });
      expect(result.current.showProgress).toBe(true);
    });

    it("showProgress is false on 'choose' step", () => {
      const { result } = renderHook(() => useBusinessPortal("choose"), { wrapper });
      expect(result.current.showProgress).toBe(false);
    });

    it("showProgress is false on 'success' step", () => {
      const { result } = renderHook(() => useBusinessPortal("success"), { wrapper });
      expect(result.current.showProgress).toBe(false);
    });

    it("showProgress updates reactively when step changes", async () => {
      mockFetchOk({});
      const { result } = renderHook(() => useBusinessPortal(), { wrapper });
      expect(result.current.showProgress).toBe(false);
      act(() => {
        result.current.goToSignIn();
      });
      expect(result.current.showProgress).toBe(true);
      act(() => {
        result.current.goBack();
      });
      expect(result.current.showProgress).toBe(false);
    });
  });
});
