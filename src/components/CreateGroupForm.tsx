import { useState } from 'react';
import { createGroup } from '@/lib/chat';
import { useUser } from '@clerk/nextjs';

export default function CreateGroupForm() {
  const { user } = useUser();
  const [state, setState] = useState({
    name: '',
    invitees: '',
    error: '',
    success: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      await createGroup(
        state.name,
        user.id,
        state.invitees.split(',').map(id => id.trim())
      );
      
      setState({
        name: '',
        invitees: '',
        error: '',
        success: 'Group created successfully!'
      });
      
      setTimeout(() => {
        setState(s => ({ ...s, success: '' }));
      }, 3000);
      
    } catch (error) {
      setState(s => ({
        ...s,
        error: 'Failed to create group. Please check user IDs.',
        success: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          type="text"
          placeholder="Group name"
          value={state.name}
          onChange={e => setState(s => ({ ...s, name: e.target.value }))}
          className="w-full p-2 bg-gray-800 rounded"
          required
        />
      </div>
      
      <div>
        <input
          type="text"
          placeholder="Invite user IDs (comma-separated)"
          value={state.invitees}
          onChange={e => setState(s => ({ ...s, invitees: e.target.value }))}
          className="w-full p-2 bg-gray-800 rounded"
          required
        />
      </div>

      {state.error && (
        <div className="text-red-500 text-sm">{state.error}</div>
      )}
      
      {state.success && (
        <div className="text-green-500 text-sm">{state.success}</div>
      )}

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
      >
        Create Group
      </button>
    </form>
  );
}
