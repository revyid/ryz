import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebaseConfig';
import { useTalkJSConversation } from '@/hooks/useChat';
import CreateGroupForm from '@/components/CreateGroupForm';

const TalkJSInbox = dynamic(
  () => import('@talkjs/react').then((mod) => mod.Inbox),
  { ssr: false }
);

const TalkJSSession = dynamic(
  () => import('@talkjs/react').then((mod) => mod.Session),
  { ssr: false }
);

export default function MessagesPage() {
  const { user } = useUser();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time groups listener
  useEffect(() => {
    if (!user?.id) return;

    const groupsRef = ref(db, 'groups');
    const unsubscribe = onValue(groupsRef, (snapshot) => {
      const groupsData: GroupData[] = [];
      snapshot.forEach(child => {
        groupsData.push(child.val());
      });
      setGroups(groupsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  useTalkJSConversation(user?.id || '', groups);

  if (!user) return <div className="p-4">Please sign in to view messages</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="p-4 border-b border-gray-700">
        <CreateGroupForm />
      </div>
      
      {loading ? (
        <div className="p-4">Loading conversations...</div>
      ) : (
        <TalkJSSession
          appId={process.env.NEXT_PUBLIC_TALKJS_APP_ID}
          user={{
            id: user.id,
            name: user.fullName,
            email: user.primaryEmailAddress?.emailAddress,
            photoUrl: user.imageUrl,
          }}
        >
          <TalkJSInbox
            style={{ width: '100%', height: '100%' }}
            syncUser
            loadingComponent={<div>Loading inbox...</div>}
          />
        </TalkJSSession>
      )}
    </div>
  );
}
