'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Mail, MessageCircle } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { CommunitySpeaker, DEFAULT_COMMUNITY_CONTENT } from '@/types/community';

export default function SpeakerProfileContent() {
  const [speaker, setSpeaker] = useState<CommunitySpeaker>(DEFAULT_COMMUNITY_CONTENT.speaker);

  useEffect(() => {
    const db = getFirebaseDb();
    if (!db) return;
    return onSnapshot(doc(db, 'communityContent', 'current'), snapshot => {
      const data = snapshot.data();
      if (data?.speaker) setSpeaker({ ...DEFAULT_COMMUNITY_CONTENT.speaker, ...data.speaker });
    });
  }, []);

  return (
    <>
      <section className="mt-12 grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
        <div className="flex aspect-[4/5] max-w-sm items-center justify-center overflow-hidden rounded-[2rem] bg-[#3186FF]/10 text-8xl font-extrabold text-[#3186FF]">
          {speaker.photoURL ? (
            <img
              src={speaker.photoURL}
              alt={speaker.name}
              className="h-full w-full object-cover"
              style={{ objectPosition: 'center 18%' }}
            />
          ) : (
            'S'
          )}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3186FF]">Featured speaker</p>
          <h1 className="mt-3 text-5xl font-extrabold leading-tight text-[#1E1E1E] sm:text-7xl">{speaker.name}</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#1E1E1E]/65 sm:text-lg">{speaker.bio}</p>
          <p className="mt-4 text-sm font-bold text-[#3186FF]">Topic: {speaker.topic}</p>
          <div className="mt-8 flex flex-wrap gap-3"><a href="https://chat.whatsapp.com/DYTOUzvXlUEHr4SDPOKTuN" target="_blank" rel="noreferrer" className="btn-primary"><MessageCircle className="h-4 w-4" /> Get the announcement</a>{speaker.linkedin && <a href={speaker.linkedin} target="_blank" rel="noreferrer" className="btn-secondary"><ArrowUpRight className="h-4 w-4" /> LinkedIn</a>}{speaker.instagram && <a href={speaker.instagram} target="_blank" rel="noreferrer" className="btn-secondary"><ArrowUpRight className="h-4 w-4" /> Instagram</a>}<a href="mailto:community@devnvisuals.com" className="btn-secondary"><Mail className="h-4 w-4" /> Contact</a></div>
        </div>
      </section>
      <section className="mt-16 grid gap-3 sm:grid-cols-3">{['Background and work', 'Session topic', 'Social links'].map(label => <div key={label} className="glass-card p-6"><ArrowUpRight className="h-5 w-5 text-[#3186FF]" /><h2 className="mt-8 font-bold text-[#1E1E1E]">{label}</h2><p className="mt-2 text-sm leading-6 text-[#1E1E1E]/55">{label === 'Session topic' ? speaker.topic : label === 'Background and work' ? speaker.bio : 'Follow the speaker links above for updates.'}</p></div>)}</section>
    </>
  );
}
