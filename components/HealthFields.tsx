"use client";

import { useId } from "react";
import { BLOOD_GROUPS } from "@/lib/blood-groups";
import { GENOTYPES } from "@/lib/genotypes";

// The values of the fields below. Kept by the form that uses them.
export type HealthValues = {
  dateOfBirth: string;
  bloodGroup: string;
  genotype: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
};

type Props = {
  values: HealthValues;
  onChange: (key: keyof HealthValues, value: string) => void;
};

// Date of birth, blood group and genotype. Shared by the "Edit profile" and "Edit passport details" forms.
export function HealthBasics({ values, onChange, today, dobRequired }: Props & { today: string; dobRequired?: boolean }) {
  const id = useId();

  return (
    <>
      <div>
        <label htmlFor={`${id}-dob`} className="label">Date of birth{dobRequired ? "" : " (optional)"}</label>
        <input
          id={`${id}-dob`}
          name="dateOfBirth"
          type="date"
          max={today}
          required={dobRequired}
          autoComplete="bday"
          value={values.dateOfBirth}
          onChange={(e) => onChange("dateOfBirth", e.target.value)}
          className="input"
        />
      </div>

      <div>
        <label htmlFor={`${id}-blood`} className="label">Blood group (optional)</label>
        <select id={`${id}-blood`} name="bloodGroup" value={values.bloodGroup} onChange={(e) => onChange("bloodGroup", e.target.value)} className="input">
          <option value="">Not sure / prefer not to say</option>
          {BLOOD_GROUPS.map((group) => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${id}-genotype`} className="label">Genotype (optional)</label>
        <select id={`${id}-genotype`} name="genotype" value={values.genotype} onChange={(e) => onChange("genotype", e.target.value)} className="input">
          <option value="">Not sure / prefer not to say</option>
          {GENOTYPES.map((genotype) => (
            <option key={genotype} value={genotype}>{genotype}</option>
          ))}
        </select>
      </div>
    </>
  );
}

export function EmergencyContactFields({ values, onChange }: Props) {
  const id = useId();

  return (
    <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4">
      <legend className="px-1 text-sm font-medium text-slate-700">Emergency contact (optional)</legend>
      <div>
        <label htmlFor={`${id}-contact-name`} className="label">Their name</label>
        <input
          id={`${id}-contact-name`}
          name="emergencyContactName"
          type="text"
          value={values.emergencyContactName}
          onChange={(e) => onChange("emergencyContactName", e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label htmlFor={`${id}-contact-phone`} className="label">Their phone number</label>
        <input
          id={`${id}-contact-phone`}
          name="emergencyContactPhone"
          type="tel"
          autoComplete="off"
          value={values.emergencyContactPhone}
          onChange={(e) => onChange("emergencyContactPhone", e.target.value)}
          className="input"
        />
      </div>
    </fieldset>
  );
}
