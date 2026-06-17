"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { SpeakerDialog } from "@/components/forms/speaker-form";
import { PartnerDialog } from "@/components/forms/partner-form";
import { PitchDialog } from "@/components/forms/pitch-form";
import { ExhibitorDialog } from "@/components/forms/exhibitor-form";
import { SponsorDialog } from "@/components/forms/sponsor-form";
import { AttendeeDialog } from "@/components/forms/attendee-form";

type BtnProps = React.ComponentProps<typeof Button>;

export function SpeakerApplyButton(props: BtnProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button {...props} onClick={() => setOpen(true)} />
      <SpeakerDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export function PartnerApplyButton(props: BtnProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button {...props} onClick={() => setOpen(true)} />
      <PartnerDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export function PitchApplyButton(props: BtnProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button {...props} onClick={() => setOpen(true)} />
      <PitchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export function BoothReserveButton({
  boothId,
  ...props
}: BtnProps & { boothId?: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button {...props} onClick={() => setOpen(true)} />
      <ExhibitorDialog open={open} onOpenChange={setOpen} initialBooth={boothId} />
    </>
  );
}

export function SponsorTierButton({
  tierId,
  ...props
}: BtnProps & { tierId?: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button {...props} onClick={() => setOpen(true)} />
      <SponsorDialog open={open} onOpenChange={setOpen} initialTier={tierId} />
    </>
  );
}

export function AttendeeRegisterButton({
  initialPass,
  ...props
}: BtnProps & { initialPass?: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button {...props} onClick={() => setOpen(true)} />
      <AttendeeDialog open={open} onOpenChange={setOpen} initialPass={initialPass} />
    </>
  );
}
