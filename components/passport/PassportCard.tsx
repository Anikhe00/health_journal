import { formatDob, orNotProvided, saysNone, sexLabel, type PassportData } from "@/lib/passport";
import Photo from "@/components/Photo";

// ID-card size in pixels (85.6 x 54 mm). Same size and look as the Emergency Health Passport card.
export const CARD_WIDTH = 432;
export const CARD_HEIGHT = 272;

const BAND_TEAL = "#0e524f";

type Props = {
  variant: "front" | "back";
  data: PassportData;
  qrDataUrl: string;
  verifyText: string; // e.g. "patientlog.example/scan/abc123"
};

export default function PassportCard({ variant, data, qrDataUrl, verifyText }: Props) {
  return (
    <div
      className="relative flex shrink-0 flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
    >
      {variant === "front" ? <Front data={data} qrDataUrl={qrDataUrl} /> : <Back data={data} verifyText={verifyText} />}
    </div>
  );
}

function Front({ data, qrDataUrl }: { data: PassportData; qrDataUrl: string }) {
  return (
    <>
      <div className="absolute inset-x-0 top-0 h-16" style={{ backgroundColor: BAND_TEAL }}>
        <div className="absolute left-5 top-[18px] flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-[7px] bg-white">
            <span className="text-[15px] font-bold" style={{ color: BAND_TEAL }}>+</span>
          </div>
          <div className="flex flex-col items-start leading-tight">
            <p className="text-[11px] font-semibold text-white">EMERGENCY HEALTH ID</p>
            <p className="text-[9px] text-[#bad9d3]">Nigeria</p>
          </div>
        </div>
      </div>

      <div className="absolute left-[19px] top-[85px] flex flex-col items-start">
        <p className="max-w-[235px] truncate text-[20px] font-semibold text-[#02021b]">{data.fullName}</p>
        <p className="mt-[3px] text-[11px] text-[#737e96]">
          DOB {formatDob(data.dateOfBirth)} · {sexLabel(data.sex)}
        </p>
      </div>

      <StatChip label="BLOOD GROUP" value={data.bloodGroup ?? "—"} left={19} />
      <StatChip label="GENOTYPE" value={data.genotype ?? "—"} left={117} />

      {/* The QR code gets the whole right side: bigger squares are easier to scan when printed (about 28 mm wide). */}
      <div className="absolute left-[262px] top-[74px] rounded-lg border border-[#e2e8f0] bg-white p-2">
        <Photo src={qrDataUrl} alt="QR code with emergency information" className="size-[140px]" />
      </div>
      <p className="absolute left-[262px] top-[238px] w-[160px] text-center text-[9px] text-[#737e96]">Scan for emergency info</p>

      <p className="absolute left-[19px] top-[235px] text-[9px] text-[#737e96]">If found, please contact emergency services</p>
    </>
  );
}

function StatChip({ label, value, left }: { label: string; value: string; left: number }) {
  return (
    <div
      className="absolute top-[149px] flex h-12 w-[90px] flex-col justify-center gap-px rounded-lg border border-[#e2e8f0] bg-[#f8f9fa] px-3"
      style={{ left }}
    >
      <p className="text-[8px] font-semibold text-[#737e96]">{label}</p>
      <p className="text-[18px] font-bold text-[#02021b]">{value}</p>
    </div>
  );
}

function Back({ data, verifyText }: { data: PassportData; verifyText: string }) {
  const hasAllergies = Boolean(data.allergies?.trim()) && !saysNone(data.allergies);
  const noAllergies = saysNone(data.allergies);
  const contact = data.emergencyContact;

  return (
    <>
      <div className="h-[18px] w-full shrink-0" style={{ backgroundColor: BAND_TEAL }} />

      <div className="flex flex-1 flex-col gap-2.5 px-[19px] pt-[13px]">
        <div
          className={`flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-3 text-[12px] font-semibold ${
            hasAllergies
              ? "border-[#fccbcb] bg-[#fef2f2] text-[#b72429]"
              : noAllergies
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          <span aria-hidden>{noAllergies ? "✓" : "⚠"}</span>
          <span className="truncate">
            {hasAllergies ? `Allergic to ${data.allergies}` : noAllergies ? "No known allergies" : "Not provided — do not assume none"}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2.5">
          <div className="flex justify-between gap-3">
            <Field label="CONDITIONS" value={orNotProvided(data.chronicConditions)} />
            <Field label="MEDICATIONS" value={orNotProvided(data.currentMedications)} />
          </div>
          <div className="flex flex-col items-start">
            <p className="text-[8px] font-semibold text-[#737e96]">EMERGENCY CONTACT</p>
            <p className="mt-px text-[12px] font-medium text-[#02021b]">
              {contact ? `${contact.name} — ${contact.phone}` : "Not provided"}
            </p>
          </div>
        </div>

        <div className="h-px w-full shrink-0 bg-[#e2e8f0]" />

        <div className="mb-[14px] flex shrink-0 flex-col items-end text-[9px] text-[#737e96]">
          <p className="font-medium">ID {data.id}</p>
          <p>Verify at {verifyText}</p>
        </div>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-1/2 flex-col items-start">
      <p className="text-[8px] font-semibold text-[#737e96]">{label}</p>
      <p className="mt-px line-clamp-3 text-[12px] font-medium leading-snug text-[#02021b]">{value}</p>
    </div>
  );
}
