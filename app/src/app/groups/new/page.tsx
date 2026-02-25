import { CreateGroupForm } from "./CreateGroupForm";

export default function NewGroupPage() {
  return (
    <div className="mx-auto max-w-md p-8">
      <h2 className="mb-6 text-xl font-bold">Create a group</h2>
      <CreateGroupForm />
    </div>
  );
}
