import { db } from '@/lib/firebaseConfig';
import { ref, push, set } from 'firebase/database';

export interface GroupData {
  id: string;
  name: string;
  members: Record<string, boolean>;
  createdBy: string;
  createdAt: string;
}

export async function createGroup(
  name: string,
  creatorId: string,
  invitedUserIds: string[]
): Promise<GroupData> {
  const groupRef = ref(db, 'groups');
  const newGroupRef = push(groupRef);
  const groupId = newGroupRef.key!;

  const members = invitedUserIds.reduce((acc, userId) => {
    acc[userId] = true;
    return acc;
  }, { [creatorId]: true } as Record<string, boolean>);

  const groupData: GroupData = {
    id: groupId,
    name,
    members,
    createdBy: creatorId,
    createdAt: new Date().toISOString()
  };

  await set(newGroupRef, groupData);
  return groupData;
}
