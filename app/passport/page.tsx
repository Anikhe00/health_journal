import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { publicOrigin } from "@/lib/app-url";
import { requireUserId } from "@/lib/auth";
import { getTimeZone } from "@/lib/timezone";
import { todayInputValue, toInputValue } from "@/lib/dates";
import { parseTags, type Tag } from "@/lib/tags";
import { buildScanUrl, type PassportData } from "@/lib/passport";
import PassportCards from "@/app/passport/PassportCards";
import PassportForm from "@/app/passport/PassportForm";
import DrawerButton from "@/components/DrawerButton";
import { DrawerProvider, OpenDrawerButton } from "@/components/DrawerProvider";
import { ChevronRight, PencilIcon, rowClass } from "@/components/ListRows";

const MAX_SUGGESTIONS = 8;

export default async function PassportPage() {
  const userId = await requireUserId();

  const [user, passport, entries] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.passport.findUnique({ where: { userId } }),
    prisma.entry.findMany({
      where: { userId, OR: [{ tags: { contains: "Diagnosis" } }, { tags: { contains: "Medication" } }] },
      select: { title: true, tags: true },
      orderBy: { date: "desc" },
      take: 40,
    }),
  ]);
  if (!user) notFound();

  // One-tap suggestions for the form: titles of the person's own Diagnosis and Medication entries.
  const titlesTagged = (tag: Tag) => [
    ...new Set(entries.filter((e) => parseTags(e.tags).includes(tag)).map((e) => e.title)),
  ].slice(0, MAX_SUGGESTIONS);
  const suggestions = { diagnoses: titlesTagged("Diagnosis"), medications: titlesTagged("Medication") };

  const emergencyContact = user.emergencyContactPhone
    ? { name: user.emergencyContactName || "Emergency contact", phone: user.emergencyContactPhone }
    : null;

  // The card, once the passport has been created (it always has a date of birth by then).
  const data: PassportData | null =
    passport && user.dateOfBirth
      ? {
          id: passport.id,
          fullName: user.name,
          dateOfBirth: toInputValue(user.dateOfBirth),
          sex: passport.sex,
          bloodGroup: user.bloodGroup,
          genotype: user.genotype,
          allergies: passport.allergies,
          chronicConditions: passport.chronicConditions,
          currentMedications: passport.currentMedications,
          emergencyContact,
          updatedAt: passport.updatedAt.toISOString(),
        }
      : null;

  const scanUrl = data ? buildScanUrl(data, publicOrigin()) : null;
  const qrDataUrl = scanUrl
    ? await QRCode.toDataURL(scanUrl, { errorCorrectionLevel: "M", margin: 1, width: 300, color: { dark: "#0e5250", light: "#ffffff" } })
    : null;

  // The one form for everything on the card. (Date of birth, blood group, genotype and the emergency contact
  // are the same details as on the profile, so changing them here changes them there too.)
  const editor = (
    <PassportForm
      today={todayInputValue(await getTimeZone())}
      initial={{
        sex: passport?.sex ?? "",
        dateOfBirth: user.dateOfBirth ? toInputValue(user.dateOfBirth) : "",
        bloodGroup: user.bloodGroup ?? "",
        genotype: user.genotype ?? "",
        allergies: passport?.allergies ?? "",
        chronicConditions: passport?.chronicConditions ?? "",
        currentMedications: passport?.currentMedications ?? "",
        emergencyContactName: user.emergencyContactName ?? "",
        emergencyContactPhone: user.emergencyContactPhone ?? "",
      }}
      suggestions={suggestions}
      hasPassport={Boolean(passport)}
    />
  );

  // What the card still lacks. (Typing "None" counts as an answer; an empty box does not.)
  const missing = [
    !passport?.allergies && "allergies",
    !passport?.chronicConditions && "ongoing conditions",
    !passport?.currentMedications && "regular medicines",
    !user.bloodGroup && "blood group",
    !user.genotype && "genotype",
    !emergencyContact && "emergency contact",
  ].filter((item): item is string => Boolean(item));

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Health passport</h1>
        <p className="text-sm text-slate-600 sm:text-base">
          Show this card in an emergency. Anyone who scans the QR code sees your blood group, allergies and who to call.
        </p>
      </div>

      {data && scanUrl && qrDataUrl ? (
        <DrawerProvider title="Edit passport details" content={editor}>
          {missing.length > 0 && (
            <p className="-mt-3 text-sm text-slate-600">
              Your health passport is incomplete. Still missing: {missing.join(", ")}.{" "}
              <OpenDrawerButton className="font-medium text-teal-700 underline">Complete it now</OpenDrawerButton>
            </p>
          )}

          <PassportCards data={data} qrDataUrl={qrDataUrl} scanUrl={scanUrl}>
            <OpenDrawerButton className={rowClass}>
              <PencilIcon />
              <span className="flex-1">Edit passport details</span>
              <ChevronRight />
            </OpenDrawerButton>
          </PassportCards>
        </DrawerProvider>
      ) : (
        <div className="space-y-4">
          <p className="text-slate-600">You don&apos;t need any journal entries. Just add your details and your card is ready.</p>
          <DrawerButton title="Create your passport" buttonClassName="btn-primary" button={passport ? "Add your details" : "Create my passport"}>
            {editor}
          </DrawerButton>
        </div>
      )}

      <p className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
        Changed your details? Print a new card, because old cards don&apos;t update.
      </p>
    </div>
  );
}
