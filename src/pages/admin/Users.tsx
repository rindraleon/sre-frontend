import { Select } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { KeyRound, UserRoundCog } from "lucide-react";
import type { AppUser } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSre } from "@/context/SreContext";
import { callApi, mapApiUser, type ApiUser } from "@/services/api-client";
import {
  StatusBadge,
  Button,
  ConfirmDialog,
  PageHeader,
  DataTable,
  toTanstackColumns,
  type TableColumn,
} from "@/components/ui";
import { formatDate } from "@/utils/format";

export function AdminUsersPage() {
  const { state, updateState, notify } = useSre();
  const { session } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("TOUS");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [accountTarget, setAccountTarget] = useState<AppUser | null>(null);
  const [processing, setProcessing] = useState(false);
  const [actionError, setErrorAction] = useState("");
  const users = useMemo(
    () => state.users.filter((account) => roleFilter === "TOUS" || account.role === roleFilter),
    [state.users, roleFilter],
  );

  const columns: TableColumn<AppUser>[] = [
    {
      id: "compte",
      title: "Utilisateur",
      render: (account) => (
        <div className="table-identity-link-sre">
          <span className="row-avatar-sre">
            <UserRoundCog size={15} />
          </span>
          <span>
            <strong>{account.name}</strong>
            <small>{account.email}</small>
          </span>
        </div>
      ),
      sortValue: (account) => account.name,
    },
    {
      id: "role",
      title: "Rôle",
      render: (account) => <StatusBadge status={account.role} />,
      sortValue: (account) => account.role,
    },
    {
      id: "statut",
      title: "Statut",
      render: (account) => <StatusBadge status={account.status} />,
      sortValue: (account) => account.status,
    },
    {
      id: "mdp",
      title: "Sécurité",
      render: (account) =>
        account.mustChangePassword ? (
          <span className="attention-text-sre">
            <KeyRound size={13} /> Changement requis
          </span>
        ) : (
          <span className="success-text-sre">Mot de passe défini</span>
        ),
    },
    {
      id: "cree",
      title: "Créé le",
      render: (account) => formatDate(account.createdAt),
      sortValue: (account) => account.createdAt,
    },
    {
      id: "connexion",
      title: "Dernière connexion",
      render: (account) => formatDate(account.lastLoginAt, true),
      sortValue: (account) => account.lastLoginAt ?? "",
    },
    {
      id: "action",
      title: "Action",
      render: (account) =>
        account.id === session?.userId ? (
          <span className="secondary-text-sre">Session actuelle</span>
        ) : (
          <Button
            size="small"
            variant={account.status === "ACTIF" ? "danger" : "outline"}
            onClick={() => setAccountTarget(account)}
          >
            {account.status === "ACTIF" ? "Désactiver" : "Réactiver"}
          </Button>
        ),
    },
  ];

  const confirmChangeStatus = async () => {
    if (!accountTarget || !session?.apiToken) return;
    const status = accountTarget.status === "ACTIF" ? "INACTIF" : "ACTIF";
    setErrorAction("");
    setProcessing(true);
    try {
      const response = await callApi<ApiUser>(
        `utilisateurs/${encodeURIComponent(accountTarget.id)}/statut`,
        { method: "PATCH", token: session.apiToken, body: { statut: status } },
      );
      const userUpdated = mapApiUser(response);
      updateState((current) => ({
        ...current,
        users: current.users.map((account) =>
          account.id === userUpdated.id ? userUpdated : account,
        ),
        taxpayers: current.taxpayers.map((taxpayer) =>
          taxpayer.userId === userUpdated.id
            ? { ...taxpayer, status: userUpdated.status }
            : taxpayer,
        ),
      }));
      notify(
        status === "ACTIF"
          ? "Compte réactivé sur le serveur."
          : "Compte désactivé sur le serveur. Les données sont conservées.",
        "success",
      );
      setAccountTarget(null);
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Le serveur n’a pas modifié le compte.";
      setErrorAction(message);
      notify(message, "error");
    } finally {
      setProcessing(false);
    }
  };

  const reactivate = accountTarget?.status !== "ACTIF";
  return (
    <div className="page-content-sre">
      <PageHeader
        title="Comptes utilisateurs"
        description="Consultez les comptes et gérez leur statut d’accès."
        breadcrumb={["Accueil", "Comptes utilisateurs"]}
      />
      <DataTable
        data={users}
        columns={toTanstackColumns(columns)}
        label="Comptes utilisateurs"
        getRowId={(account) => account.id}
        getSearchText={(account) => `${account.name} ${account.email} ${account.role}`}
        searchPlaceholder="Nom ou adresse e-mail…"
        searchValue={search}
        onSearchChange={setSearch}
        toolbarActions={
          <label className="compact-filter-sre">
            Rôle
            <Select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="TOUS">Tous les rôles</option>
              <option value="ADMIN">Administrateurs</option>
              <option value="CLIENT">Contribuables</option>
            </Select>
          </label>
        }
        columnToggle
        emptyTitle="Aucun utilisateur"
        emptyDescription="Aucun utilisateur ne correspond à votre recherche."
        page={page}
        rowsPerPage={perPage}
        onPageChange={setPage}
        onRowsPerPageChange={setPerPage}
      />
      <ConfirmDialog
        open={!!accountTarget}
        title={reactivate ? "Réactiver ce compte ?" : "Désactiver ce compte ?"}
        description={
          reactivate
            ? `L’accès de ${accountTarget?.name} sera réactivé sur le serveur.`
            : `L’accès de ${accountTarget?.name} sera suspendu. Les données associées seront conservées. Le dernier administrateur actif ne peut pas être désactivé.`
        }
        close={() => setAccountTarget(null)}
        confirm={() => void confirmChangeStatus()}
        confirmLabel={reactivate ? "Réactiver le compte" : "Désactiver le compte"}
        danger={!reactivate}
        loading={processing}
        error={actionError}
      />
    </div>
  );
}
