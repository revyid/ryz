import { useEffect } from 'react';
import Talk from 'talkjs';
import { GroupData } from '@/lib/chat';

export function useTalkJSConversation(
  userId: string,
  groups: GroupData[]
) {
  useEffect(() => {
    if (typeof window === 'undefined' || !userId) return;

    let session: Talk.Session | null = null;

    const initTalkJS = async () => {
      try {
        await Talk.ready;
        
        session = new Talk.Session({
          appId: process.env.NEXT_PUBLIC_TALKJS_APP_ID!,
          me: new Talk.User({ id: userId }),
        });

        groups.forEach(group => {
          const conversation = session!.getOrCreateConversation(group.id);
          conversation.setAttributes({
            subject: group.name,
            participants: Object.keys(group.members).map(
              memberId => new Talk.User({ id: memberId })
            )
          });
        });
      } catch (err) {
        console.error('TalkJS initialization failed:', err);
      }
    };

    initTalkJS();

    return () => {
      if (session) {
        session.destroy();
      }
    };
  }, [userId, groups]);
}
