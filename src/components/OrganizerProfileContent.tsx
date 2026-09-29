"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Mail, MessageCircle, Users } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import {
  CommunityOrganizer,
  DEFAULT_COMMUNITY_CONTENT,
} from "@/types/community";

export default function OrganizerProfileContent() {
  const [organizers, setOrganizers] = useState<CommunityOrganizer[]>(
    DEFAULT_COMMUNITY_CONTENT.organizers,
  );

  useEffect(() => {
    const db = getFirebaseDb();
    if (!db) return;
    return onSnapshot(doc(db, "communityContent", "current"), (snapshot) => {
      const data = snapshot.data();
      const savedOrganizers = Array.isArray(data?.organizers)
        ? (data.organizers as CommunityOrganizer[])
        : DEFAULT_COMMUNITY_CONTENT.organizers;

      const normalizedOrganizers = savedOrganizers
        .filter(
          (organizer) =>
            organizer?.name && organizer.name !== "DevN'Visuals community team",
        )
        .map((organizer) => ({
          ...organizer,
          photoURL:
            organizer.photoURL ||
            (organizer.name === "Ayomiposi BALOGUN"
              ? "/organizers/Organizer-1.png"
              : ""),
        }));

      setOrganizers(
        normalizedOrganizers.length > 0
          ? normalizedOrganizers
          : DEFAULT_COMMUNITY_CONTENT.organizers,
      );
    });
  }, []);

  return (
    <>
      <div className="mt-12 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#34A853]">
          The people behind the room
        </p>
        <h1 className="mt-3 text-5xl font-extrabold leading-tight text-[#1E1E1E] sm:text-7xl">
          Meet the community team.
        </h1>
        <p className="mt-6 text-base leading-8 text-[#1E1E1E]/65 sm:text-lg">
          DevN&apos;Visuals organizers shape the topics, welcome new people, and
          help every session feel open and useful.
        </p>
      </div>
      <section className="mt-12 grid gap-3 md:grid-cols-3">
        {organizers.map((organizer) => (
          <div
            key={`${organizer.name}-${organizer.role}`}
            className="glass-card overflow-hidden p-0"
          >
            <div className="h-56 overflow-hidden bg-[#DCEFE0] sm:h-64">
              {organizer.photoURL ? (
                <img
                  src={organizer.photoURL}
                  alt={organizer.name}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: "center 18%" }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-5xl font-extrabold text-[#34A853]">
                  {organizer.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="px-6 pb-6 pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#34A853]">
                {organizer.role}
              </p>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight text-[#1E1E1E] sm:text-4xl">
                {organizer.name}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#1E1E1E]/55">
                Community organizer and session host.
              </p>
              {organizer.contact && (
                <a
                  href={
                    organizer.contact.includes("@")
                      ? `mailto:${organizer.contact}`
                      : organizer.contact
                  }
                  target={organizer.contact.includes("@") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#34A853]"
                >
                  Contact organizer <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </section>
      <section className="mt-12 rounded-[2rem] border border-[#34A853]/20 bg-[#34A853]/8 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <Users className="mt-1 h-5 w-5 shrink-0 text-[#34A853]" />
          <div>
            <h2 className="text-xl font-extrabold text-[#1E1E1E]">
              Want to help shape the next session?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#1E1E1E]/60">
              Reach the organizers through WhatsApp or email and tell us what
              you would like to bring to the community.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="https://chat.whatsapp.com/DYTOUzvXlUEHr4SDPOKTuN"
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp the team
              </a>
              <a
                href="mailto:community@devnvisuals.com"
                className="btn-secondary"
              >
                <Mail className="h-4 w-4" /> Email organizers
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
