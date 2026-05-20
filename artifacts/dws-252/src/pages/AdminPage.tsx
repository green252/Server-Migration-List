import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  useListApplications,
  getListApplicationsQueryKey,
  useDeleteApplication,
  useGetStats,
} from "@workspace/api-client-react";
import { useI18n } from "@/contexts/I18nContext";
import { Language } from "@/i18n";
import * as XLSX from "xlsx";

const LANGUAGE_OPTIONS: { code: Language; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
  { code: "vi", label: "Tiếng Việt" },
];

const GRADE_BADGES: Record<string, string> = {
  normal: "bg-gray-700 text-gray-300 border border-gray-600",
  intermediate: "bg-blue-900 text-blue-300 border border-blue-700",
  advanced: "bg-purple-900 text-purple-300 border border-purple-700",
  special: "bg-orange-900 text-orange-300 border border-orange-700",
};

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { t, language, setLanguage } = useI18n();
  const queryClient = useQueryClient();

  const { data: applications, isLoading: appsLoading } = useListApplications();
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const deleteApp = useDeleteApplication();

  const handleDelete = (uid: string) => {
    deleteApp.mutate(
      { uid },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
        },
      }
    );
  };

  const handleExport = () => {
    if (!applications) return;
    const gradeLabel: Record<string, string> = {
      normal: t("normal"),
      intermediate: t("intermediate"),
      advanced: t("advanced"),
      special: t("special"),
    };
    const genderLabel: Record<string, string> = {
      male: t("male"),
      female: t("female"),
    };

    const rows = applications.map((a) => ({
      UID: a.uid,
      [t("nickname")]: a.nickname,
      [t("allianceName")]: a.allianceName,
      [t("nationality")]: a.nationality,
      [t("gender")]: genderLabel[a.gender] || a.gender,
      [t("grade")]: gradeLabel[a.grade] || a.grade,
      [t("towerLevel")]: a.towerLevel,
      [`${t("combatPower")}(m)`]: a.combatPower,
      [t("desiredAlliance")]: a.desiredAlliance,
      [t("appliedAt")]: new Date(a.createdAt).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "252서버 이민 명단");
    XLSX.writeFile(wb, "252서버_이민신청_명단.xlsx");
  };

  const formatGrade = (grade: string) => {
    const map: Record<string, string> = {
      normal: t("normal"),
      intermediate: t("intermediate"),
      advanced: t("advanced"),
      special: t("special"),
    };
    return map[grade] || grade;
  };

  return (
    <div className="min-h-screen bg-black text-green-200">
      {/* Language selector */}
      <div className="fixed top-4 right-4 z-50">
        <select
          data-testid="language-selector"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-black border border-green-800 text-green-400 text-xs px-2 py-1 rounded focus:outline-none cursor-pointer"
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.code} value={opt.code} className="bg-black">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-green-700 text-xs font-mono mb-1">[ ADMIN ACCESS GRANTED ]</div>
            <h1
              className="text-white font-bold text-2xl"
              style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.06em" }}
              data-testid="text-admin-title"
            >
              {t("adminTitle")}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              data-testid="button-export-excel"
              onClick={handleExport}
              disabled={!applications || applications.length === 0}
              className="px-4 py-2 bg-green-700 hover:bg-green-600 disabled:bg-green-950 disabled:text-green-800 text-black font-bold text-xs rounded tracking-widest uppercase transition-all"
            >
              {t("exportExcel")}
            </button>
            <button
              data-testid="button-back-home"
              onClick={() => setLocation("/")}
              className="px-4 py-2 border border-green-800 hover:border-green-600 text-green-600 hover:text-green-400 text-xs rounded tracking-widest uppercase transition-all"
            >
              HOME
            </button>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-green-700 via-green-500 to-transparent mb-6 opacity-50" />

        {/* Stats cards */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="green-gradient-border rounded-lg p-4" data-testid="stat-total">
              <div className="text-green-600 text-xs font-mono uppercase">{t("totalCount")}</div>
              <div className="text-white text-3xl font-bold mt-1">{stats.total}</div>
            </div>

            <div className="border border-green-900 rounded-lg p-4">
              <div className="text-green-600 text-xs font-mono uppercase mb-2">{t("gradeStats")}</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-gray-400">{t("normal")}</span><span className="text-gray-300 font-mono">{stats.byGrade.normal}</span></div>
                <div className="flex justify-between"><span className="text-blue-400">{t("intermediate")}</span><span className="text-blue-300 font-mono">{stats.byGrade.intermediate}</span></div>
                <div className="flex justify-between"><span className="text-purple-400">{t("advanced")}</span><span className="text-purple-300 font-mono">{stats.byGrade.advanced}</span></div>
                <div className="flex justify-between"><span className="text-orange-400">{t("special")}</span><span className="text-orange-300 font-mono">{stats.byGrade.special}</span></div>
              </div>
            </div>

            <div className="border border-green-900 rounded-lg p-4">
              <div className="text-green-600 text-xs font-mono uppercase mb-2">{t("genderStats")}</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-green-400">{t("male")}</span><span className="text-green-300 font-mono">{stats.byGender.male}</span></div>
                <div className="flex justify-between"><span className="text-green-400">{t("female")}</span><span className="text-green-300 font-mono">{stats.byGender.female}</span></div>
              </div>
            </div>

            <div className="border border-green-900 rounded-lg p-4 flex items-center justify-center">
              <div className="text-center">
                <div className="text-green-700 text-xs font-mono">SERVER</div>
                <div className="text-green-400 text-4xl font-bold font-mono">252</div>
              </div>
            </div>
          </div>
        )}

        {/* Applications table */}
        {appsLoading ? (
          <div className="text-green-700 text-sm font-mono py-10 text-center">LOADING...</div>
        ) : !applications || applications.length === 0 ? (
          <div className="text-center py-16 border border-green-900 rounded-lg">
            <div className="text-green-700 font-mono text-sm">NO APPLICATIONS YET</div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-green-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-900 bg-green-950/30">
                  {["UID", t("nickname"), t("allianceName"), t("nationality"), t("gender"), t("grade"), t("towerLevel"), `${t("combatPower")}(m)`, t("desiredAlliance"), t("appliedAt"), ""].map(
                    (h, i) => (
                      <th key={i} className="text-left text-green-600 text-xs font-mono py-3 px-3 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {applications.map((app, idx) => (
                  <tr
                    key={app.id}
                    data-testid={`row-application-${app.id}`}
                    className={`border-b border-green-900/40 transition-colors hover:bg-green-950/20 ${idx % 2 === 0 ? "" : "bg-green-950/10"}`}
                  >
                    <td className="py-3 px-3 text-green-600 font-mono text-xs">{app.uid}</td>
                    <td className="py-3 px-3 text-green-200 font-medium">{app.nickname}</td>
                    <td className="py-3 px-3 text-green-400">{app.allianceName}</td>
                    <td className="py-3 px-3 text-green-400">{app.nationality}</td>
                    <td className="py-3 px-3 text-green-400">{app.gender === "male" ? t("male") : t("female")}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${GRADE_BADGES[app.grade] || ""}`}>
                        {formatGrade(app.grade)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-green-400 font-mono text-xs">{app.towerLevel}</td>
                    <td className="py-3 px-3 text-green-300 font-mono text-xs">{app.combatPower}m</td>
                    <td className="py-3 px-3 text-green-400">{app.desiredAlliance}</td>
                    <td className="py-3 px-3 text-green-700 font-mono text-xs whitespace-nowrap">
                      {new Date(app.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        data-testid={`button-delete-${app.id}`}
                        onClick={() => handleDelete(app.uid)}
                        disabled={deleteApp.isPending}
                        className="px-2 py-1 border border-red-900 hover:border-red-600 text-red-700 hover:text-red-400 text-xs rounded transition-all"
                      >
                        {t("delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
