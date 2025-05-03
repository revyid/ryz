import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/firebaseConfig';
import { ref, set } from 'firebase/database';

export async function POST(req: Request) {
  try {
    const headerPayload = headers();
    const svixId = headerPayload.get('svix-id');
    const svixSignature = headerPayload.get('svix-signature');
    const svixTimestamp = headerPayload.get('svix-timestamp');

    if (!svixId || !svixSignature || !svixTimestamp) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const payload = await req.json();
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
    const msg = wh.verify(JSON.stringify(payload), {
      'svix-id': svixId,
      'svix-signature': svixSignature,
      'svix-timestamp': svixTimestamp,
    }) as WebhookEvent;

    switch (msg.type) {
      case 'user.created':
      case 'user.updated':
        await syncUserToFirebase(msg.data);
        break;
      
      case 'user.deleted':
        await deleteUserFromFirebase(msg.data.id);
        break;
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Webhook error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function syncUserToFirebase(user: UserJSON) {
  const userRef = ref(db, `users/${user.id}`);
  await set(userRef, {
    id: user.id,
    email: user.email_addresses[0]?.email_address,
    name: `${user.first_name} ${user.last_name}`,
    image_url: user.image_url,
    created_at: new Date(user.created_at).toISOString(),
    updated_at: new Date().toISOString()
  });
}

async function deleteUserFromFirebase(userId: string) {
  const userRef = ref(db, `users/${userId}`);
  await set(userRef, null);
}

type WebhookEvent = {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: UserJSON;
};

type UserJSON = {
  id: string;
  first_name: string;
  last_name: string;
  email_addresses: { email_address: string }[];
  image_url: string;
  created_at: number;
};