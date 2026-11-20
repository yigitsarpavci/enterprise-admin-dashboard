export const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: "same-origin",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const error = new Error("An error occurred") as Error & { info?: unknown; status?: number };
    error.info = await res.json().catch(() => ({}));
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export const apiClient = {
  post: async (url: string, data: unknown) => {
    const res = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || errorData.errors?.[0]?.msg || "Failed to post"
      );
    }
    return res.json();
  },
  delete: async (url: string) => {
    const res = await fetch(url, {
      method: "DELETE",
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || errorData.errors?.[0]?.msg || "Failed to delete"
      );
    }
    return res.json();
  },
};
