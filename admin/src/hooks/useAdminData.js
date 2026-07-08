import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../lib/api.js";

/**
 * Fetches all three inbound data sources (applications, contacts, subscribers)
 * in parallel and exposes a refresh function. Used by Dashboard and the
 * three inbound pages.
 */
export function useAdminData() {
  const [applications, setApplications] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [appRes, conRes, subRes] = await Promise.all([
        apiFetch("/api/applications"),
        apiFetch("/api/contacts"),
        apiFetch("/api/subscribers"),
      ]);
      if (appRes.ok) setApplications(await appRes.json());
      if (conRes.ok) setContacts(await conRes.json());
      if (subRes.ok) setSubscribers(await subRes.json());
    } catch (err) {
      console.error("Error reading database files:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { applications, contacts, subscribers, loading, refresh: fetchData };
}