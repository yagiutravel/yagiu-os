"use client";

import Link from "next/link";
import { useState } from "react";
import { Settings, Shield, UserRound } from "lucide-react";
import { useAuth } from "@/auth";
import { updateUserEmail, updateUserProfile } from "@/auth/auth.service";
import { ROLE_BY_KEY } from "@/tenant/constants/roles.catalog";
import type { UserProfile } from "@/auth/types";
import { PageContent } from "@/shared/components/layout/PageContent";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

type SettingToggleProps = {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
};

function SettingToggle({
  label,
  description,
  enabled,
  onChange,
}: SettingToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200/70 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-zinc-900">{label}</p>
        <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          enabled ? "bg-zinc-900" : "bg-zinc-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function ProfileSettingsForm({
  profile,
  roleLabel,
  onSaved,
}: {
  profile: UserProfile;
  roleLabel: string;
  onSaved: () => Promise<void>;
}) {
  const { showToast } = useToast();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [jobTitle, setJobTitle] = useState(profile.jobTitle);
  const [phone, setPhone] = useState(profile.phone);
  const [notificheEmail, setNotificheEmail] = useState(
    profile.preferences.notificheEmail !== false,
  );
  const [reminderAutomatici, setReminderAutomatici] = useState(
    profile.preferences.reminderAutomatici !== false,
  );
  const [vistaCompatta, setVistaCompatta] = useState(
    profile.preferences.vistaCompatta === true,
  );
  const [savingProfile, setSavingProfile] = useState(false);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateUserProfile(profile.id, {
        displayName: displayName.trim(),
        jobTitle: jobTitle.trim(),
        phone: phone.trim(),
        preferences: {
          notificheEmail,
          reminderAutomatici,
          vistaCompatta,
        },
      });
      await onSaved();
      showToast("Profilo aggiornato.", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Salvataggio profilo non riuscito",
        "error",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <CardContent className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Nome visualizzato
          </label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Ruolo
          </label>
          <input
            value={roleLabel}
            disabled
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Mansione
          </label>
          <input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Telefono
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="space-y-3 border-t border-zinc-100 pt-4">
        <SettingToggle
          label="Notifiche email"
          description="Ricevi avvisi su nuovi clienti, pagamenti e tour in partenza."
          enabled={notificheEmail}
          onChange={setNotificheEmail}
        />
        <SettingToggle
          label="Reminder automatici"
          description="Abilita promemoria per saldi, documenti e partenze imminenti."
          enabled={reminderAutomatici}
          onChange={setReminderAutomatici}
        />
        <SettingToggle
          label="Vista compatta"
          description="Riduce padding e spaziature nelle tabelle operative."
          enabled={vistaCompatta}
          onChange={setVistaCompatta}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={() => void handleSaveProfile()} disabled={savingProfile}>
          {savingProfile ? "Salvataggio…" : "Salva profilo"}
        </Button>
      </div>
    </CardContent>
  );
}

function AccountSettingsForm({ email }: { email: string }) {
  const { showToast } = useToast();
  const [nextEmail, setNextEmail] = useState(email);
  const [savingEmail, setSavingEmail] = useState(false);

  const handleSaveEmail = async () => {
    setSavingEmail(true);
    try {
      await updateUserEmail(nextEmail);
      showToast("Richiesta cambio email inviata. Conferma dal link ricevuto.", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Aggiornamento email non riuscito",
        "error",
      );
    } finally {
      setSavingEmail(false);
    }
  };

  return (
    <CardContent className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Email account
        </label>
        <input
          type="email"
          value={nextEmail}
          onChange={(e) => setNextEmail(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => void handleSaveEmail()}
          disabled={savingEmail}
        >
          {savingEmail ? "Invio…" : "Aggiorna email"}
        </Button>
        <Link
          href="/recupera-password"
          className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cambia password
        </Link>
      </div>
    </CardContent>
  );
}

export function ImpostazioniView() {
  const { profile, membership, refreshProfile } = useAuth();

  const roleLabel = membership
    ? ROLE_BY_KEY.get(membership.roleKey)?.name ?? membership.roleKey
    : "—";

  return (
    <PageContent className="space-y-6">
      <Card>
        <CardHeader
          title="Profilo utente"
          description="Dati personali e preferenze operative salvate su Supabase."
          action={
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-500/10">
              <UserRound className="h-4 w-4" strokeWidth={1.75} />
            </div>
          }
        />
        {profile ? (
          <ProfileSettingsForm
            key={profile.id}
            profile={profile}
            roleLabel={roleLabel}
            onSaved={refreshProfile}
          />
        ) : null}
      </Card>

      <Card>
        <CardHeader
          title="Account e sicurezza"
          description="Gestione credenziali e accesso."
          action={
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-500/10">
              <Shield className="h-4 w-4" strokeWidth={1.75} />
            </div>
          }
        />
        {profile ? <AccountSettingsForm key={profile.email} email={profile.email} /> : null}
      </Card>

      <Card>
        <CardHeader
          title="Organizzazione"
          description="Contesto multi-tenant attivo per la sessione corrente."
          action={
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-500/10">
              <Settings className="h-4 w-4" strokeWidth={1.75} />
            </div>
          }
        />
        <CardContent className="grid gap-3 text-sm text-zinc-600 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-400">Organization ID</p>
            <p className="mt-1 font-mono text-xs text-zinc-800">{profile?.organizationId}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-400">Workspace ID</p>
            <p className="mt-1 font-mono text-xs text-zinc-800">{profile?.workspaceId}</p>
          </div>
        </CardContent>
      </Card>
    </PageContent>
  );
}
