import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Inbox,
  Mail,
  MailCheck,
  MessageSquareReply,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Select,
  StatusBadge,
  Textarea,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import {
  getContactMessageDetailApi,
  loadContactMessagesApi,
  notifyContactMessagesUpdated,
  replyContactMessageApi,
  retryContactMessageEmailsApi,
  updateContactMessageStatusApi,
} from "@/services/api-client";
import type {
  ContactEmailStatus,
  ContactMessageEntry,
  ContactMessageSource,
  ContactMessageStatus,
  ContactMessagesCounts,
} from "@/types";
import { formatDate } from "@/utils/format";

const STATUS_LABELS: Record<ContactMessageStatus, string> = {
  NON_LU: "Non lu",
  LU: "Lu",
  EN_ATTENTE_REPONSE: "En attente de réponse",
  REPONDU: "Répondu",
};

const SOURCE_LABELS: Record<ContactMessageSource, string> = {
  SITE_PUBLIC: "Formulaire public",
  ESPACE_CLIENT: "Espace client",
};

const QUICK_REPLY_TEMPLATES: {
  label: string;
  build: (m: ContactMessageEntry) => string;
}[] = [
  {
    label: "Prise en charge",
    build: (m) =>
      `Bonjour ${m.nom},\n\nNous accusons bonne réception de votre demande concernant « ${m.sujet} » (réf. ${m.reference ?? m.id.slice(0, 8)}).\n\nVotre dossier est actuellement en cours d'examen par nos services. Nous reviendrons vers vous dans les meilleurs délais.\n\nCordialement,\nService Régional des Entreprises — Haute Matsiatra`,
  },
  {
    label: "Demande de précisions",
    build: (m) =>
      `Bonjour ${m.nom},\n\nAfin de traiter votre demande « ${m.sujet} », nous vous remercions de bien vouloir nous préciser votre numéro NIF ou STAT ainsi que la période fiscale concernée.\n\nVous pouvez répondre directement à ce courriel ou soumettre ces éléments depuis votre espace contribuable.\n\nCordialement,\nService Régional des Entreprises — Haute Matsiatra`,
  },
  {
    label: "Orientation espace client",
    build: (m) =>
      `Bonjour ${m.nom},\n\nSuite à votre message concernant « ${m.sujet} », nous vous invitons à vous connecter à votre espace contribuable sur le portail SRE où vos obligations, déclarations et reçus sont disponibles en temps réel.\n\nRestant à votre disposition,\nService Régional des Entreprises — Haute Matsiatra`,
  },
];

function resolveMessageStatus(entry: ContactMessageEntry): ContactMessageStatus {
  if (entry.statut) return entry.statut;
  return entry.lue ? "LU" : "NON_LU";
}

export function AdminContactMessagesPage() {
  const { session } = useAuth();
  const { notify } = useSre();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = session?.apiToken ?? "";

  const [messages, setMessages] = useState<ContactMessageEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [counts, setCounts] = useState<ContactMessagesCounts>({
    nonLus: 0,
    lus: 0,
    enAttenteReponse: 0,
    repondus: 0,
  });

  const [statusFilter, setStatusFilter] = useState<
    ContactMessageStatus | "TOUS"
  >("TOUS");
  const [sourceFilter, setSourceFilter] = useState<
    ContactMessageSource | "TOUS"
  >("TOUS");
  const [emailStatusFilter, setEmailStatusFilter] = useState<
    ContactEmailStatus | "TOUS"
  >("TOUS");
  const [sortBy, setSortBy] = useState<
    "non_lus" | "date_desc" | "date_asc" | "statut" | "expediteur"
  >("non_lus");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessageEntry | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [retryingEmails, setRetryingEmails] = useState(false);

  // Reply form state
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replyBanner, setReplyBanner] = useState<{
    tone: "success" | "warning" | "danger";
    text: string;
    detail?: string | null;
  } | null>(null);

  const synchronizeEntryInList = useCallback((updated: ContactMessageEntry) => {
    setMessages((previous) => {
      const next = previous.map((item) =>
        item.id === updated.id ? updated : item,
      );
      const unreadCount = next.filter(
        (m) => resolveMessageStatus(m) === "NON_LU" || !m.lue,
      ).length;
      setUnread(unreadCount);
      setCounts({
        nonLus: next.filter((m) => resolveMessageStatus(m) === "NON_LU").length,
        lus: next.filter((m) => resolveMessageStatus(m) === "LU").length,
        enAttenteReponse: next.filter(
          (m) => resolveMessageStatus(m) === "EN_ATTENTE_REPONSE",
        ).length,
        repondus: next.filter((m) => resolveMessageStatus(m) === "REPONDU")
          .length,
      });
      notifyContactMessagesUpdated(unreadCount);
      return next;
    });
    setSelectedMessage((current) =>
      current && current.id === updated.id ? updated : current,
    );
  }, []);

  const loadList = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await loadContactMessagesApi(token, {
        statut: statusFilter,
        source: sourceFilter,
        statutCourriel: emailStatusFilter,
        recherche: search,
        tri: sortBy,
        limite: 150,
      });
      setMessages(response.messages);
      setTotal(response.total);
      setUnread(response.unread);
      if (response.counts) {
        setCounts(response.counts);
      } else {
        setCounts({
          nonLus: response.messages.filter(
            (m) => resolveMessageStatus(m) === "NON_LU",
          ).length,
          lus: response.messages.filter(
            (m) => resolveMessageStatus(m) === "LU",
          ).length,
          enAttenteReponse: response.messages.filter(
            (m) => resolveMessageStatus(m) === "EN_ATTENTE_REPONSE",
          ).length,
          repondus: response.messages.filter(
            (m) => resolveMessageStatus(m) === "REPONDU",
          ).length,
        });
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Impossible de charger les messages de contact.",
      );
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, sourceFilter, emailStatusFilter, search, sortBy]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const openMessage = useCallback(
    async (entryOrId: ContactMessageEntry | string) => {
      if (!token) return;
      const id = typeof entryOrId === "string" ? entryOrId : entryOrId.id;
      setReplyBanner(null);

      if (typeof entryOrId !== "string") {
        setSelectedMessage(entryOrId);
        const defaultSubj = entryOrId.sujet.toLowerCase().startsWith("re:")
          ? entryOrId.sujet
          : `Re: ${entryOrId.sujet}`;
        setReplySubject(entryOrId.sujetReponse || defaultSubj);
      }

      setDetailLoading(true);
      try {
        const detailed = await getContactMessageDetailApi(token, id, false);
        setSelectedMessage(detailed);
        const defaultSubj = detailed.sujet.toLowerCase().startsWith("re:")
          ? detailed.sujet
          : `Re: ${detailed.sujet}`;
        setReplySubject(detailed.sujetReponse || defaultSubj);
        synchronizeEntryInList(detailed);
      } catch (cause) {
        notify(
          cause instanceof Error
            ? cause.message
            : "Impossible d'ouvrir le détail de ce message.",
          "error",
        );
      } finally {
        setDetailLoading(false);
      }
    },
    [token, notify, synchronizeEntryInList],
  );

  // Open deep-linked message from ?messageId=...
  useEffect(() => {
    const paramId = searchParams.get("messageId");
    if (
      paramId &&
      token &&
      (!selectedMessage || selectedMessage.id !== paramId)
    ) {
      void openMessage(paramId);
    }
  }, [searchParams, token, selectedMessage, openMessage]);

  const handleStatusChange = async (newStatus: ContactMessageStatus) => {
    if (!token || !selectedMessage) return;
    setStatusUpdating(true);
    try {
      const updated = await updateContactMessageStatusApi(
        token,
        selectedMessage.id,
        newStatus,
      );
      synchronizeEntryInList(updated);
      notify(`Statut mis à jour : « ${STATUS_LABELS[newStatus]} ».`, "success");
    } catch (cause) {
      notify(
        cause instanceof Error
          ? cause.message
          : "Impossible de modifier le statut du message.",
        "error",
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleSendReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !selectedMessage) return;
    const trimmedBody = replyBody.trim();
    if (trimmedBody.length < 5) {
      notify("Veuillez saisir une réponse d'au moins 5 caractères.", "warning");
      return;
    }

    setReplySending(true);
    setReplyBanner(null);
    try {
      const res = await replyContactMessageApi(token, selectedMessage.id, {
        sujet: replySubject.trim() || undefined,
        message: trimmedBody,
      });
      synchronizeEntryInList(res.message);

      if (res.resultat === "ENVOYE" || res.resultat === "CAPTURE") {
        setReplyBody("");
        setReplyBanner({
          tone: "success",
          text: res.confirmation,
        });
        notify(res.confirmation, "success");
      } else if (res.resultat === "NON_CONFIGURE") {
        setReplyBody("");
        setReplyBanner({
          tone: "warning",
          text: res.confirmation,
        });
        notify(res.confirmation, "info");
      } else {
        setReplyBanner({
          tone: "danger",
          text: res.confirmation,
          detail: res.erreurCourriel,
        });
        notify(res.confirmation, "warning");
      }
    } catch (cause) {
      const msg =
        cause instanceof Error
          ? cause.message
          : "Échec de l'envoi de la réponse.";
      setReplyBanner({
        tone: "danger",
        text: msg,
      });
      notify(msg, "error");
    } finally {
      setReplySending(false);
    }
  };

  const handleRetryEmails = async () => {
    if (!token || !selectedMessage) return;
    setRetryingEmails(true);
    try {
      const res = await retryContactMessageEmailsApi(
        token,
        selectedMessage.id,
        "TOUS",
      );
      synchronizeEntryInList(res.message);
      notify("Relance des courriels effectuée.", "success");
    } catch (cause) {
      notify(
        cause instanceof Error
          ? cause.message
          : "Impossible de relancer les courriels.",
        "error",
      );
    } finally {
      setRetryingEmails(false);
    }
  };

  const hasFailedEmail = useMemo(() => {
    if (!selectedMessage) return false;
    return (
      selectedMessage.statutCourriel === "ECHEC" ||
      selectedMessage.statutAccuse === "ECHEC" ||
      selectedMessage.statutCourrielReponse === "ECHEC"
    );
  }, [selectedMessage]);

  return (
    <div className="page-sre">
      <div className="page-header-sre">
        <div>
          <span className="eyebrow-sre">
            Administration · Messagerie centralisée
          </span>
          <h1>Messagerie & demandes de contact</h1>
          <p>
            Consultez les messages reçus depuis le formulaire public et l’espace
            contribuable, gérez leur statut de suivi et répondez directement par
            e-mail aux expéditeurs.
          </p>
        </div>
        <div className="actions-line-sre">
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => void loadList()}
          >
            <RefreshCw size={15} /> Actualiser
          </Button>
        </div>
      </div>

      {/* Quick status filter cards */}
      <div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 mb-5"
        role="region"
        aria-label="Synthèse des messages par statut"
      >
        <button
          type="button"
          onClick={() => setStatusFilter("TOUS")}
          className={`text-left rounded-xl border p-3.5 transition-all ${
            statusFilter === "TOUS"
              ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Tous les messages</span>
            <Inbox size={15} className="text-blue-600" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">
            {total}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("NON_LU")}
          className={`text-left rounded-xl border p-3.5 transition-all ${
            statusFilter === "NON_LU"
              ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 shadow-sm"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Non lus</span>
            <Mail size={15} className="text-amber-500" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {counts.nonLus ?? unread}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("EN_ATTENTE_REPONSE")}
          className={`text-left rounded-xl border p-3.5 transition-all ${
            statusFilter === "EN_ATTENTE_REPONSE"
              ? "border-orange-500 bg-orange-50/70 dark:bg-orange-950/40 shadow-sm"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>En attente de réponse</span>
            <Clock size={15} className="text-orange-500" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-orange-600 dark:text-orange-400">
            {counts.enAttenteReponse}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("REPONDU")}
          className={`text-left rounded-xl border p-3.5 transition-all ${
            statusFilter === "REPONDU"
              ? "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-sm"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Répondus</span>
            <MailCheck size={15} className="text-emerald-600" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {counts.repondus}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("LU")}
          className={`text-left rounded-xl border p-3.5 transition-all ${
            statusFilter === "LU"
              ? "border-sky-600 bg-sky-50/70 dark:bg-sky-950/40 shadow-sm"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Lus (sans réponse)</span>
            <CheckCircle2 size={15} className="text-sky-600" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-sky-600 dark:text-sky-400">
            {counts.lus}
          </div>
        </button>
      </div>

      {/* Search, filter and sort bar */}
      <Card className="mb-5">
        <CardContent className="pt-5">
          <div className="grid gap-3 md:grid-cols-12 items-end">
            <div className="md:col-span-4 relative">
              <label
                htmlFor="search-contact-messages"
                className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1"
              >
                Rechercher
              </label>
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <Input
                  id="search-contact-messages"
                  aria-label="Rechercher dans les messages"
                  placeholder="Nom, e-mail, référence MSG-..., sujet ou texte…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="filter-status-contact"
                className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1"
              >
                Statut du message
              </label>
              <Select
                id="filter-status-contact"
                aria-label="Filtrer par statut du message"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as ContactMessageStatus | "TOUS",
                  )
                }
              >
                <option value="TOUS">Tous les statuts</option>
                <option value="NON_LU">Non lu</option>
                <option value="LU">Lu</option>
                <option value="EN_ATTENTE_REPONSE">
                  En attente de réponse
                </option>
                <option value="REPONDU">Répondu</option>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="filter-source-contact"
                className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1"
              >
                Origine
              </label>
              <Select
                id="filter-source-contact"
                aria-label="Filtrer par origine"
                value={sourceFilter}
                onChange={(e) =>
                  setSourceFilter(
                    e.target.value as ContactMessageSource | "TOUS",
                  )
                }
              >
                <option value="TOUS">Toutes les origines</option>
                <option value="SITE_PUBLIC">Formulaire public</option>
                <option value="ESPACE_CLIENT">Espace client</option>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="filter-email-contact"
                className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1"
              >
                Notification e-mail
              </label>
              <Select
                id="filter-email-contact"
                aria-label="Filtrer par statut d'e-mail"
                value={emailStatusFilter}
                onChange={(e) =>
                  setEmailStatusFilter(
                    e.target.value as ContactEmailStatus | "TOUS",
                  )
                }
              >
                <option value="TOUS">Tous les envois</option>
                <option value="ENVOYE">E-mail envoyé</option>
                <option value="ECHEC">Échec d’envoi</option>
                <option value="NON_CONFIGURE">Non configuré</option>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="sort-contact-messages"
                className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1"
              >
                Trier par
              </label>
              <Select
                id="sort-contact-messages"
                aria-label="Trier les messages"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | "non_lus"
                      | "date_desc"
                      | "date_asc"
                      | "statut"
                      | "expediteur",
                  )
                }
              >
                <option value="non_lus">Non lus d’abord</option>
                <option value="date_desc">Plus récents</option>
                <option value="date_asc">Plus anciens</option>
                <option value="statut">Par statut</option>
                <option value="expediteur">Par expéditeur (A-Z)</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="alert-sre alert-sre--error" role="alert">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Master-Detail layout */}
      <div className="grid gap-5 lg:grid-cols-12 items-start">
        {/* Message list column */}
        <div
          className={
            selectedMessage ? "lg:col-span-5 w-full" : "lg:col-span-12 w-full"
          }
        >
          <Card>
            <CardHeader>
              <CardTitle>Boîte de réception</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {messages.length} message(s) affiché(s) · {unread} non lu(s)
              </p>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <EmptyState
                  title={
                    loading ? "Chargement en cours…" : "Aucun message trouvé"
                  }
                  description="Les messages envoyés depuis le formulaire de contact public ou l'espace client apparaissent ici en temps réel."
                />
              ) : (
                <div
                  className="divide-y divide-slate-200 dark:divide-slate-800"
                  role="list"
                  aria-label="Liste des messages de contact"
                >
                  {messages.map((item) => {
                    const status = resolveMessageStatus(item);
                    const isUnread = status === "NON_LU" || !item.lue;
                    const isSelected = selectedMessage?.id === item.id;
                    const refCode =
                      item.reference ??
                      `MSG-${item.id.slice(0, 8).toUpperCase()}`;

                    return (
                      <div
                        key={item.id}
                        role="listitem"
                        data-testid={`contact-message-row-${item.id}`}
                        onClick={() => void openMessage(item)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            void openMessage(item);
                          }
                        }}
                        tabIndex={0}
                        className={`cursor-pointer p-4 transition-colors rounded-lg ${
                          isSelected
                            ? "bg-blue-50/90 dark:bg-blue-950/50 ring-1 ring-blue-500/40"
                            : isUnread
                              ? "bg-amber-50/40 dark:bg-amber-950/20 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            {isUnread && (
                              <span
                                className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"
                                title="Message non lu"
                              />
                            )}
                            <span
                              className={`truncate text-sm ${
                                isUnread
                                  ? "font-bold text-slate-900 dark:text-white"
                                  : "font-semibold text-slate-800 dark:text-slate-200"
                              }`}
                            >
                              {item.nom}
                            </span>
                            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {refCode}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(item.creeLe, true)}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 flex flex-wrap items-center gap-2">
                          <span>{item.courriel}</span>
                          <span>·</span>
                          <span>
                            {SOURCE_LABELS[item.source ?? "SITE_PUBLIC"]}
                          </span>
                        </div>

                        <div
                          className={`text-sm mb-1 ${
                            isUnread
                              ? "font-semibold text-slate-900 dark:text-white"
                              : "font-medium text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {item.sujet}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2.5">
                          {item.message}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <StatusBadge status={status} />
                            {item.statutAccuse && (
                              <StatusBadge status={item.statutAccuse} />
                            )}
                            {item.statutCourriel === "ECHEC" && (
                              <StatusBadge status="ECHEC" />
                            )}
                          </div>

                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            {isSelected ? "Ouvert" : "Ouvrir & répondre →"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message detail & direct reply column */}
        {selectedMessage && (
          <div
            className="lg:col-span-7 w-full"
            data-testid="contact-message-detail-panel"
          >
            <Card>
              <CardContent className="pt-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {selectedMessage.reference ??
                          `MSG-${selectedMessage.id.slice(0, 8).toUpperCase()}`}
                      </span>
                      <StatusBadge
                        status={resolveMessageStatus(selectedMessage)}
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {SOURCE_LABELS[selectedMessage.source ?? "SITE_PUBLIC"]}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedMessage.sujet}
                    </h2>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    aria-label="Fermer le détail du message"
                    onClick={() => {
                      setSelectedMessage(null);
                      if (searchParams.has("messageId")) {
                        searchParams.delete("messageId");
                        setSearchParams(searchParams, { replace: true });
                      }
                    }}
                  >
                    <X size={16} /> Fermer
                  </Button>
                </div>

                {detailLoading && (
                  <p className="text-xs text-slate-500 mb-3">
                    Synchronisation du message…
                  </p>
                )}

                {/* Sender metadata */}
                <div className="grid gap-3 sm:grid-cols-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 mb-4 text-xs">
                  <div className="flex items-start gap-2.5">
                    <UserRound
                      size={16}
                      className="text-blue-600 shrink-0 mt-0.5"
                    />
                    <div>
                      <div className="text-slate-500 dark:text-slate-400">
                        Expéditeur
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">
                        {selectedMessage.nom}
                      </div>
                      <a
                        href={`mailto:${selectedMessage.courriel}`}
                        className="text-blue-600 dark:text-blue-400 underline"
                      >
                        {selectedMessage.courriel}
                      </a>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">
                        Reçu le :{" "}
                      </span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {formatDate(selectedMessage.creeLe, true)}
                      </strong>
                    </div>
                    {selectedMessage.luLe && (
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">
                          Consulté le :{" "}
                        </span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {formatDate(selectedMessage.luLe, true)}
                        </strong>
                      </div>
                    )}
                    {selectedMessage.reponduLe && (
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">
                          Dernière réponse :{" "}
                        </span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {formatDate(selectedMessage.reponduLe, true)}
                          {selectedMessage.reponduParNom
                            ? ` par ${selectedMessage.reponduParNom}`
                            : ""}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status management bar */}
                <div className="mb-4">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Gérer le statut du message
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        "NON_LU",
                        "LU",
                        "EN_ATTENTE_REPONSE",
                        "REPONDU",
                      ] as ContactMessageStatus[]
                    ).map((st) => {
                      const active =
                        resolveMessageStatus(selectedMessage) === st;
                      return (
                        <Button
                          key={st}
                          type="button"
                          variant={active ? "primary" : "secondary"}
                          disabled={statusUpdating || active}
                          onClick={() => void handleStatusChange(st)}
                        >
                          {STATUS_LABELS[st]}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Full message content */}
                <div className="mb-5">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Contenu complet du message
                  </span>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-100">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Email delivery diagnostics & retry */}
                <div className="mb-5 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/60 dark:bg-slate-900/50">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Traçabilité des notifications & accusés e-mail
                    </span>
                    {hasFailedEmail && (
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={retryingEmails}
                        onClick={() => void handleRetryEmails()}
                      >
                        <RotateCcw size={14} />{" "}
                        {retryingEmails
                          ? "Relance en cours…"
                          : "Relancer les envois en échec"}
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3 text-xs">
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5">
                      <div className="text-slate-500 mb-1">
                        Notification e-mail admin
                      </div>
                      <StatusBadge status={selectedMessage.statutCourriel} />
                      {selectedMessage.derniereErreurCourriel && (
                        <p className="mt-1 text-red-600 dark:text-red-400">
                          {selectedMessage.derniereErreurCourriel}
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5">
                      <div className="text-slate-500 mb-1">
                        Accusé de réception visiteur
                      </div>
                      <StatusBadge
                        status={selectedMessage.statutAccuse ?? "NON_CONFIGURE"}
                      />
                      {selectedMessage.derniereErreurAccuse && (
                        <p className="mt-1 text-red-600 dark:text-red-400">
                          {selectedMessage.derniereErreurAccuse}
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5">
                      <div className="text-slate-500 mb-1">
                        Courriel de réponse admin
                      </div>
                      {selectedMessage.statutCourrielReponse ? (
                        <>
                          <StatusBadge
                            status={selectedMessage.statutCourrielReponse}
                          />
                          {selectedMessage.derniereErreurCourrielReponse && (
                            <p className="mt-1 text-red-600 dark:text-red-400">
                              {selectedMessage.derniereErreurCourrielReponse}
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400">
                          Aucune réponse envoyée
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Previous replies history */}
                {selectedMessage.historiqueReponses &&
                  selectedMessage.historiqueReponses.length > 0 && (
                    <div className="mb-5">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        Historique des réponses (
                        {selectedMessage.historiqueReponses.length})
                      </span>
                      <div className="space-y-2.5">
                        {selectedMessage.historiqueReponses.map((rep) => (
                          <div
                            key={rep.id}
                            className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 text-xs"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                              <div className="font-semibold text-slate-800 dark:text-slate-100">
                                {rep.sujet} · par {rep.reponduParNom}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500">
                                  {formatDate(rep.reponduLe, true)}
                                </span>
                                <StatusBadge status={rep.statutCourriel} />
                              </div>
                            </div>
                            <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-200 leading-relaxed">
                              {rep.message}
                            </div>
                            {rep.erreurCourriel && (
                              <p className="mt-1.5 text-red-600 dark:text-red-400">
                                Erreur : {rep.erreurCourriel}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Direct Reply Form */}
                <form
                  onSubmit={(e) => void handleSendReply(e)}
                  className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 p-4"
                  aria-label="Répondre directement par e-mail"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquareReply size={18} className="text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Répondre directement à {selectedMessage.nom} (
                        {selectedMessage.courriel})
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Sparkles size={12} /> Modèles :
                      </span>
                      {QUICK_REPLY_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.label}
                          type="button"
                          onClick={() =>
                            setReplyBody(tpl.build(selectedMessage))
                          }
                          className="text-xs px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {replyBanner && (
                    <div
                      role="status"
                      data-testid="contact-reply-confirmation"
                      className={`mb-3 rounded-lg p-3 text-xs font-medium flex items-start gap-2 ${
                        replyBanner.tone === "success"
                          ? "bg-emerald-100/80 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800"
                          : replyBanner.tone === "warning"
                            ? "bg-amber-100/80 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200 border border-amber-300 dark:border-amber-800"
                            : "bg-red-100/80 text-red-900 dark:bg-red-950/70 dark:text-red-200 border border-red-300 dark:border-red-800"
                      }`}
                    >
                      {replyBanner.tone === "success" ? (
                        <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div>{replyBanner.text}</div>
                        {replyBanner.detail && (
                          <div className="mt-1 opacity-85">
                            Détail technique : {replyBanner.detail}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="reply-subject-input"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Objet du courriel de réponse
                      </label>
                      <Input
                        id="reply-subject-input"
                        value={replySubject}
                        onChange={(e) => setReplySubject(e.target.value)}
                        placeholder={`Re: ${selectedMessage.sujet}`}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="reply-body-textarea"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Votre réponse (envoyée à {selectedMessage.courriel})
                      </label>
                      <Textarea
                        id="reply-body-textarea"
                        rows={5}
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        placeholder="Rédigez votre réponse officielle à destination de l'expéditeur…"
                        required
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="text-xs text-slate-500">
                        La réponse sera enregistrée dans le dossier et marquera
                        le message comme « Répondu ».
                      </span>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={replySending || replyBody.trim().length < 5}
                        data-testid="send-contact-reply-button"
                      >
                        <Send size={15} />{" "}
                        {replySending
                          ? "Envoi de la réponse…"
                          : "Envoyer la réponse par e-mail"}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
