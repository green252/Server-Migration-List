import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useI18n } from "@/contexts/I18nContext";
import { Language } from "@/i18n";
import { useCreateApplication } from "@workspace/api-client-react";

const LANGUAGE_OPTIONS: { code: Language; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
  { code: "vi", label: "Tiếng Việt" },
];

type Grade = "normal" | "intermediate" | "advanced" | "special";
type Gender = "male" | "female";

const GRADE_STYLES: Record<Grade, string> = {
  normal: "border-gray-500 text-gray-300 bg-gray-800 hover:bg-gray-700",
  intermediate: "border-blue-500 text-blue-300 bg-blue-950 hover:bg-blue-900",
  advanced: "border-purple-500 text-purple-300 bg-purple-950 hover:bg-purple-900",
  special: "border-orange-500 text-orange-300 bg-orange-950 hover:bg-orange-900",
};

const GRADE_SELECTED: Record<Grade, string> = {
  normal: "border-gray-400 text-gray-100 bg-gray-600 ring-2 ring-gray-400",
  intermediate: "border-blue-400 text-blue-100 bg-blue-700 ring-2 ring-blue-400",
  advanced: "border-purple-400 text-purple-100 bg-purple-700 ring-2 ring-purple-400",
  special: "border-orange-400 text-orange-100 bg-orange-600 ring-2 ring-orange-400",
};

export default function FormPage() {
  const params = useParams<{ uid: string }>();
  const uid = params.uid || "";
  const [, setLocation] = useLocation();
  const { t, language, setLanguage } = useI18n();
  const createApplication = useCreateApplication();

  const [form, setForm] = useState({
    nickname: "",
    allianceName: "",
    nationality: "",
    gender: "" as Gender | "",
    grade: "" as Grade | "",
    towerLevel: "",
    combatPower: "",
    desiredAlliance: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const isValid =
    form.nickname.trim() &&
    form.allianceName.trim() &&
    form.nationality.trim() &&
    form.gender &&
    form.grade &&
    form.towerLevel.trim() &&
    form.combatPower.trim() &&
    form.desiredAlliance.trim();

  const handleSubmit = () => {
    if (!isValid) return;

    createApplication.mutate(
      {
        data: {
          uid,
          nickname: form.nickname.trim(),
          allianceName: form.allianceName.trim(),
          nationality: form.nationality.trim(),
          gender: form.gender as Gender,
          grade: form.grade as Grade,
          towerLevel: form.towerLevel.trim(),
          combatPower: parseFloat(form.combatPower),
          desiredAlliance: form.desiredAlliance.trim(),
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true);
        },
        onError: (err: unknown) => {
          const anyErr = err as { status?: number };
          if (anyErr?.status === 409) {
            setError(t("errorConflict"));
          } else {
            setError(t("errorGeneric"));
          }
        },
      }
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
        <div className="green-gradient-border green-glow rounded-xl p-10 max-w-sm w-full text-center">
          <div className="text-5xl mb-4 text-green-400">&#10003;</div>
          <h2 className="text-green-300 text-xl font-bold mb-2">{t("successTitle")}</h2>
          <p className="text-green-600 text-sm">{t("successMessage")}</p>
          <button
            onClick={() => setLocation("/")}
            className="mt-6 w-full py-2 bg-green-700 hover:bg-green-600 text-black font-bold rounded text-sm tracking-widest uppercase transition-all"
            data-testid="button-back-home"
          >
            HOME
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-200">
      {/* Language selector */}
      <div className="fixed top-4 right-4 z-50">
        <select
          data-testid="language-selector"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-black border border-green-800 text-green-400 text-xs px-2 py-1 rounded focus:outline-none focus:border-green-500 cursor-pointer"
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.code} value={opt.code} className="bg-black">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="max-w-lg mx-auto px-5 py-10 pb-20">
        {/* Header */}
        <div className="mb-8">
          <div className="text-green-700 text-xs font-mono mb-1">UID: {uid}</div>
          <h1
            className="text-white font-bold text-2xl mb-2"
            style={{ fontFamily: "'Rajdhani', 'Noto Sans KR', sans-serif" }}
            data-testid="text-form-title"
          >
            {t("formTitle")}
          </h1>
          <div className="h-px bg-gradient-to-r from-green-700 to-transparent mb-3" />
          <p className="text-green-500 text-sm leading-relaxed">{t("formSubtitle")}</p>
        </div>

        {/* Form fields */}
        <div className="space-y-6">
          {/* 1. Nickname */}
          <div className="flex flex-col gap-1.5">
            <label className="text-green-400 text-xs font-mono uppercase tracking-wider">
              01. {t("nickname")}
            </label>
            <input
              data-testid="input-nickname"
              type="text"
              value={form.nickname}
              onChange={(e) => handleChange("nickname", e.target.value)}
              className="w-full bg-black border border-green-900 focus:border-green-500 text-green-200 rounded px-3 py-2.5 text-sm focus:outline-none transition-colors"
              placeholder={t("nickname")}
            />
          </div>

          {/* 2. Alliance */}
          <div className="flex flex-col gap-1.5">
            <label className="text-green-400 text-xs font-mono uppercase tracking-wider">
              02. {t("allianceName")}
            </label>
            <input
              data-testid="input-alliance-name"
              type="text"
              value={form.allianceName}
              onChange={(e) => handleChange("allianceName", e.target.value)}
              className="w-full bg-black border border-green-900 focus:border-green-500 text-green-200 rounded px-3 py-2.5 text-sm focus:outline-none transition-colors"
              placeholder={t("allianceName")}
            />
          </div>

          {/* 3. Nationality */}
          <div className="flex flex-col gap-1.5">
            <label className="text-green-400 text-xs font-mono uppercase tracking-wider">
              03. {t("nationality")}
            </label>
            <input
              data-testid="input-nationality"
              type="text"
              value={form.nationality}
              onChange={(e) => handleChange("nationality", e.target.value)}
              className="w-full bg-black border border-green-900 focus:border-green-500 text-green-200 rounded px-3 py-2.5 text-sm focus:outline-none transition-colors"
              placeholder={t("nationality")}
            />
          </div>

          {/* 4. Gender */}
          <div className="flex flex-col gap-1.5">
            <label className="text-green-400 text-xs font-mono uppercase tracking-wider">
              04. {t("gender")}
            </label>
            <div className="flex gap-3">
              {(["male", "female"] as Gender[]).map((g) => (
                <button
                  key={g}
                  data-testid={`button-gender-${g}`}
                  onClick={() => handleChange("gender", g)}
                  className={`flex-1 py-2.5 rounded border text-sm font-medium transition-all ${
                    form.gender === g
                      ? "border-green-400 bg-green-900 text-green-100 ring-1 ring-green-400"
                      : "border-green-900 bg-black text-green-600 hover:border-green-700"
                  }`}
                >
                  {g === "male" ? t("male") : t("female")}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Grade */}
          <div className="flex flex-col gap-1.5">
            <label className="text-green-400 text-xs font-mono uppercase tracking-wider">
              05. {t("grade")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["normal", "intermediate", "advanced", "special"] as Grade[]).map((g) => (
                <button
                  key={g}
                  data-testid={`button-grade-${g}`}
                  onClick={() => handleChange("grade", g)}
                  className={`py-2.5 rounded border text-sm font-semibold transition-all ${
                    form.grade === g ? GRADE_SELECTED[g] : GRADE_STYLES[g]
                  }`}
                >
                  {t(g as "normal" | "intermediate" | "advanced" | "special")}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Tower Level */}
          <div className="flex flex-col gap-1.5">
            <label className="text-green-400 text-xs font-mono uppercase tracking-wider">
              06. {t("towerLevel")}
            </label>
            <input
              data-testid="input-tower-level"
              type="text"
              value={form.towerLevel}
              onChange={(e) => handleChange("towerLevel", e.target.value)}
              className="w-full bg-black border border-green-900 focus:border-green-500 text-green-200 rounded px-3 py-2.5 text-sm focus:outline-none transition-colors"
              placeholder={t("towerPlaceholder")}
            />
          </div>

          {/* 7. Combat Power */}
          <div className="flex flex-col gap-1.5">
            <label className="text-green-400 text-xs font-mono uppercase tracking-wider">
              07. {t("combatPower")}
            </label>
            <div className="flex items-center gap-2">
              <input
                data-testid="input-combat-power"
                type="number"
                min="0"
                step="0.1"
                value={form.combatPower}
                onChange={(e) => handleChange("combatPower", e.target.value)}
                className="flex-1 bg-black border border-green-900 focus:border-green-500 text-green-200 rounded px-3 py-2.5 text-sm focus:outline-none transition-colors"
                placeholder="0.0"
              />
              <span className="text-green-500 font-mono text-sm font-bold w-8">m</span>
            </div>
          </div>

          {/* 8. Desired Alliance */}
          <div className="flex flex-col gap-1.5">
            <label className="text-green-400 text-xs font-mono uppercase tracking-wider">
              08. {t("desiredAlliance")}
            </label>
            <input
              data-testid="input-desired-alliance"
              type="text"
              value={form.desiredAlliance}
              onChange={(e) => handleChange("desiredAlliance", e.target.value)}
              className="w-full bg-black border border-green-900 focus:border-green-500 text-green-200 rounded px-3 py-2.5 text-sm focus:outline-none transition-colors"
              placeholder={t("desiredAlliance")}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="mt-4 p-3 border border-red-800 bg-red-950 text-red-400 text-sm rounded"
            data-testid="text-error"
          >
            {error}
          </div>
        )}

        {/* Submit button */}
        <div className="mt-8">
          <div className="h-px bg-gradient-to-r from-transparent via-green-800 to-transparent mb-6" />
          <button
            data-testid="button-submit"
            onClick={handleSubmit}
            disabled={!isValid || createApplication.isPending}
            className="w-full py-3.5 bg-green-600 hover:bg-green-500 disabled:bg-green-900 disabled:text-green-700 text-black font-bold rounded tracking-widest uppercase transition-all duration-200 text-sm"
          >
            {createApplication.isPending ? "..." : t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
